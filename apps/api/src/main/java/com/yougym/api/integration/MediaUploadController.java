package com.yougym.api.integration;

import com.yougym.api.audit.AuditLogService;
import com.yougym.api.config.AdminAccessService;
import com.yougym.api.config.AdminPermission;
import com.yougym.api.content.ContentRepository;
import com.yougym.api.catalog.service.FoodCatalogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@RestController
@RequestMapping("/api/file")
public class MediaUploadController {
    private static final long MAX_FILE_SIZE = 50L * 1024 * 1024;
    private static final int MAX_FILES = 10;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "bmp", "webp",
            "mp4", "mov", "avi", "webm", "mkv",
            "glb", "gltf", "fbx", "obj", "stl", "usdz",
            "pdf", "zip", "json");

    private final AdminAccessService accessService;
    private final AuditLogService auditLogService;
    private final IntegrationService integrationService;
    private final MockObjectStorageGateway mockStorage;
    private final ContentRepository contentRepository;
    private final FoodCatalogService foodCatalogService;

    public MediaUploadController(AdminAccessService accessService, AuditLogService auditLogService,
                                 IntegrationService integrationService, MockObjectStorageGateway mockStorage,
                                 ContentRepository contentRepository, FoodCatalogService foodCatalogService) {
        this.accessService = accessService;
        this.auditLogService = auditLogService;
        this.integrationService = integrationService;
        this.mockStorage = mockStorage;
        this.contentRepository = contentRepository;
        this.foodCatalogService = foodCatalogService;
    }

    @PostMapping(value = "/media-upload/batch", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> batchUpload(@RequestParam("file") List<MultipartFile> files, HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.CONTENT_MANAGE);
        if (files == null || files.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "select at least one file");
        if (files.size() > MAX_FILES) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "at most 10 files per batch");

        List<Map<String, Object>> uploaded = new ArrayList<>();
        List<Map<String, Object>> failed = new ArrayList<>();
        for (int index = 0; index < files.size(); index++) {
            MultipartFile file = files.get(index);
            String originalName = file.getOriginalFilename();
            try {
                validate(file, originalName);
                String extension = extension(originalName);
                LocalDate today = LocalDate.now(ZoneOffset.UTC);
                String objectName = "content/%d/%02d/%s.%s".formatted(today.getYear(), today.getMonthValue(),
                        UUID.randomUUID().toString().replace("-", ""), extension);
                ObjectStorageGateway.UploadResult result;
                try (InputStream input = file.getInputStream()) {
                    result = integrationService.upload(objectName, input, file.getSize(), effectiveContentType(file, extension));
                }
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("index", index);
                item.put("url", result.signedUrl());
                item.put("objectName", result.objectKey());
                item.put("fileName", originalName);
                item.put("fileSize", file.getSize());
                item.put("uploadTime", Instant.now());
                item.put("fileType", effectiveContentType(file, extension));
                item.put("fileETag", result.etag());
                item.put("expiresIn", result.expiresInSeconds());
                item.put("provider", result.provider());
                item.put("success", true);
                uploaded.add(item);
            } catch (Exception exception) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("index", index);
                item.put("fileName", originalName == null ? "unknown" : originalName);
                item.put("error", userMessage(exception));
                failed.add(item);
            }
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalFiles", files.size());
        data.put("uploadedCount", uploaded.size());
        data.put("failedCount", failed.size());
        data.put("uploadedFiles", uploaded);
        data.put("failedFiles", failed);
        data.put("success", !uploaded.isEmpty());
        data.put("allSuccess", failed.isEmpty());
        auditLogService.record(principal, "CONTENT_MEDIA_UPLOADED", "content_media", null, request,
                Map.of("totalFiles", files.size(), "uploadedCount", uploaded.size(), "failedCount", failed.size()));
        return Map.of("code", 200, "msg", "success", "data", data);
    }

    @GetMapping("/mock-media")
    public ResponseEntity<byte[]> mockMedia(@RequestParam String objectKey) {
        if (!integrationService.isMock()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        MockObjectStorageGateway.StoredObject object = mockStorage.find(objectKey);
        if (object == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        MediaType type;
        try { type = MediaType.parseMediaType(object.contentType()); }
        catch (Exception ignored) { type = MediaType.APPLICATION_OCTET_STREAM; }
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).contentType(type).body(object.bytes());
    }

    @GetMapping("/media-url")
    public Map<String, Object> mediaUrl(@RequestParam String objectName, HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.CONTENT_READ);
        if (!isContentObjectName(objectName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid content media object name");
        }
        ObjectStorageGateway.ResolvedUrl resolved = integrationService.resolveObjectUrl(objectName);
        auditLogService.record(principal, "CONTENT_MEDIA_URL_REFRESHED", "content_media", objectName, request, Map.of());
        return Map.of("code", 200, "msg", "success", "data", Map.of(
                "url", resolved.url(), "objectName", objectName, "expiresIn", resolved.expiresInSeconds()));
    }

    @DeleteMapping("/media")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMedia(@RequestParam String objectName, HttpServletRequest request) {
        var principal = accessService.authorize(request, AdminPermission.CONTENT_MANAGE);
        if (!isContentObjectName(objectName)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid content media object name");
        if (contentRepository.isMediaObjectReferenced(objectName)
                || foodCatalogService.isMediaObjectReferenced(objectName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "media is still referenced");
        }
        if (!integrationService.deleteObject(objectName)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "media not found");
        auditLogService.record(principal, "CONTENT_MEDIA_DELETED", "content_media", objectName, request, Map.of());
    }

    private static void validate(MultipartFile file, String originalName) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("文件为空");
        if (file.getSize() > MAX_FILE_SIZE) throw new IllegalArgumentException("单个文件不能超过 50MB");
        if (originalName == null || originalName.isBlank()) throw new IllegalArgumentException("文件名不能为空");
        if (!ALLOWED_EXTENSIONS.contains(extension(originalName))) throw new IllegalArgumentException("不支持该文件格式");
    }

    private static String extension(String fileName) {
        int dot = fileName == null ? -1 : fileName.lastIndexOf('.');
        return dot < 0 || dot == fileName.length() - 1 ? "" : fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private static boolean isContentObjectName(String objectName) {
        return objectName != null && objectName.matches("^(?:[A-Za-z0-9._-]+/)*content/\\d{4}/\\d{2}/[a-f0-9]{32}\\.[A-Za-z0-9]+$");
    }

    private static String effectiveContentType(MultipartFile file, String extension) {
        return switch (extension) {
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG_VALUE;
            case "png" -> MediaType.IMAGE_PNG_VALUE;
            case "gif" -> MediaType.IMAGE_GIF_VALUE;
            case "bmp" -> "image/bmp";
            case "webp" -> "image/webp";
            case "mp4" -> "video/mp4";
            case "mov" -> "video/quicktime";
            case "avi" -> "video/x-msvideo";
            case "webm" -> "video/webm";
            case "mkv" -> "video/x-matroska";
            case "glb" -> "model/gltf-binary";
            case "gltf" -> "model/gltf+json";
            case "fbx" -> "application/octet-stream";
            case "obj" -> "model/obj";
            case "stl" -> "model/stl";
            case "usdz" -> "model/vnd.usdz+zip";
            case "pdf" -> MediaType.APPLICATION_PDF_VALUE;
            case "json" -> MediaType.APPLICATION_JSON_VALUE;
            case "zip" -> "application/zip";
            default -> MediaType.APPLICATION_OCTET_STREAM_VALUE;
        };
    }

    private static String userMessage(Exception exception) {
        if (exception instanceof IllegalArgumentException) return exception.getMessage();
        return "上传失败：" + (exception.getMessage() == null ? "存储服务异常" : exception.getMessage());
    }
}
