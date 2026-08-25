package com.yougym.api.analytics.service.impl;

import com.yougym.api.analytics.dto.AnalyticsUserQuery;
import com.yougym.api.analytics.mapper.AnalyticsUserMapper;
import com.yougym.api.analytics.service.AnalyticsUserService;
import com.yougym.api.analytics.vo.AnalyticsUserVO;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class AnalyticsUserServiceImpl implements AnalyticsUserService {
    private final AnalyticsUserMapper analyticsUserMapper;

    public AnalyticsUserServiceImpl(AnalyticsUserMapper analyticsUserMapper) {
        this.analyticsUserMapper = analyticsUserMapper;
    }

    @Override
    public List<AnalyticsUserVO> listUsers(AnalyticsUserQuery query) {
        return analyticsUserMapper.selectUsers(query.from(), query.to(), normalizeSearch(query.search()), query.limit());
    }

    @Override
    public CsvExport exportUsersCsv(AnalyticsUserQuery query) {
        List<AnalyticsUserVO> users = listUsers(query);
        StringBuilder csv = new StringBuilder("analyticsUserId,userType,eventCount,firstSeen,lastSeen,platform\n");
        for (AnalyticsUserVO user : users) {
            csv.append(String.join(",",
                    quote(user.analyticsUserId()), quote(user.userType()), quote(user.eventCount()),
                    quote(user.firstSeen()), quote(user.lastSeen()), quote(user.platform()))).append('\n');
        }
        return new CsvExport(csv.toString().getBytes(StandardCharsets.UTF_8), users.size());
    }

    private static String normalizeSearch(String search) {
        return search == null || search.isBlank() ? null : search.trim().toLowerCase(java.util.Locale.ROOT);
    }

    private static String quote(Object value) {
        String text = value == null ? "" : String.valueOf(value);
        return "\"" + text.replace("\"", "\"\"") + "\"";
    }
}
