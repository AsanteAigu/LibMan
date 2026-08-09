package com.libman.api.web.dto;

import jakarta.validation.constraints.NotBlank;

public class SettingDtos {

    public record UpdateSettingRequest(@NotBlank(message = "Enter a value") String value) {
    }
}
