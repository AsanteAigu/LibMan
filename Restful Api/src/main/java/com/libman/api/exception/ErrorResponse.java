package com.libman.api.exception;

import java.util.Map;

/** Matches Frontend/types/api.ts ApiError exactly: { error: { code, message, fields? } }. */
public record ErrorResponse(ErrorBody error) {

    public record ErrorBody(String code, String message, Map<String, String> fields) {
    }

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(new ErrorBody(code, message, null));
    }

    public static ErrorResponse of(String code, String message, Map<String, String> fields) {
        return new ErrorResponse(new ErrorBody(code, message, fields));
    }
}
