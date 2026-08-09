package com.libman.api.service;

import com.libman.api.domain.Setting;
import com.libman.api.exception.AppException;
import com.libman.api.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SettingRepository settingRepository;

    @Transactional(readOnly = true)
    public List<Setting> list() {
        return settingRepository.findAll();
    }

    @Transactional
    public Setting update(String key, String value) {
        Setting setting = settingRepository.findById(key).orElseThrow(() -> AppException.notFound("Setting"));
        setting.setValue(value);
        return settingRepository.save(setting);
    }

    /** Used by LoanService/EbookLoanService for late-fee and grace-period math. Falls back to
     * fallback if the key is missing so a deleted setting row doesn't take down borrowing. */
    @Transactional(readOnly = true)
    public BigDecimal getDecimal(String key, BigDecimal fallback) {
        return settingRepository.findById(key)
                .map(s -> new BigDecimal(s.getValue()))
                .orElse(fallback);
    }
}
