package com.libman.api.web;

import com.libman.api.domain.Setting;
import com.libman.api.service.SettingsService;
import com.libman.api.web.dto.SettingDtos.UpdateSettingRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('LIBRARIAN')")
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public List<Setting> list() {
        return settingsService.list();
    }

    @PatchMapping("/{key}")
    public Setting update(@PathVariable String key, @Valid @RequestBody UpdateSettingRequest request) {
        return settingsService.update(key, request.value());
    }
}
