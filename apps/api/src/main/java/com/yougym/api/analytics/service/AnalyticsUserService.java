package com.yougym.api.analytics.service;

import com.yougym.api.analytics.dto.AnalyticsUserQuery;
import com.yougym.api.analytics.vo.AnalyticsUserVO;

import java.util.List;

public interface AnalyticsUserService {
    List<AnalyticsUserVO> listUsers(AnalyticsUserQuery query);

    long countUsers(AnalyticsUserQuery query);

    CsvExport exportUsersCsv(AnalyticsUserQuery query);

    record CsvExport(byte[] content, int count) {}
}
