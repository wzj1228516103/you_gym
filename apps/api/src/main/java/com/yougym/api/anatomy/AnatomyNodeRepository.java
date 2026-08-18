package com.yougym.api.anatomy;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AnatomyNodeRepository {
    private final JdbcTemplate jdbcTemplate;

    public AnatomyNodeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AnatomyNode> findEnabled() {
        return jdbcTemplate.query("""
                SELECT id, parent_id, code, name_zh, name_en, level_no, view_name, side,
                       gender_scope, asset_path, sort_order
                FROM anatomy_node
                WHERE enabled = TRUE
                ORDER BY level_no, sort_order, id
                """, (rs, rowNum) -> new AnatomyNode(
                rs.getString("id"), rs.getString("parent_id"), rs.getString("code"),
                rs.getString("name_zh"), rs.getString("name_en"), rs.getInt("level_no"),
                rs.getString("view_name"), rs.getString("side"), rs.getString("gender_scope"),
                rs.getString("asset_path"), rs.getInt("sort_order")));
    }

    public List<AnatomyNode> findAll() {
        return jdbcTemplate.query("""
                SELECT id, parent_id, code, name_zh, name_en, level_no, view_name, side,
                       gender_scope, asset_path, sort_order
                FROM anatomy_node
                ORDER BY level_no, sort_order, id
                """, (rs, rowNum) -> new AnatomyNode(
                rs.getString("id"), rs.getString("parent_id"), rs.getString("code"),
                rs.getString("name_zh"), rs.getString("name_en"), rs.getInt("level_no"),
                rs.getString("view_name"), rs.getString("side"), rs.getString("gender_scope"),
                rs.getString("asset_path"), rs.getInt("sort_order")));
    }

    public record AnatomyNode(String id, String parentId, String code, String nameZh, String nameEn,
                              int level, String view, String side, String genderScope,
                              String assetPath, int sortOrder) {}
}
