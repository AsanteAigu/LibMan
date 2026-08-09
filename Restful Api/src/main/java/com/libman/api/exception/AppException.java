package com.libman.api.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** A deliberate, user-facing business error. Caught by GlobalExceptionHandler and rendered
 * as { "error": { "code", "message" } } — never a raw stack trace. */
@Getter
public class AppException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public AppException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static AppException notFound(String what) {
        return new AppException(HttpStatus.NOT_FOUND, "NOT_FOUND", what + " not found.");
    }

    public static AppException badRequest(String code, String message) {
        return new AppException(HttpStatus.BAD_REQUEST, code, message);
    }

    public static AppException conflict(String code, String message) {
        return new AppException(HttpStatus.CONFLICT, code, message);
    }

    public static AppException unprocessable(String code, String message) {
        return new AppException(HttpStatus.UNPROCESSABLE_CONTENT, code, message);
    }

    public static AppException forbidden(String message) {
        return new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", message);
    }
}
