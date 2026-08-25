package com.yougym.api.analytics.mapper;

import com.yougym.api.analytics.vo.AnalyticsUserVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.Instant;
import java.util.List;

@Mapper
public interface AnalyticsUserMapper {
    List<AnalyticsUserVO> selectUsers(@Param("from") Instant from,
                                      @Param("to") Instant to,
                                      @Param("search") String search,
                                      @Param("limit") int limit);
}
