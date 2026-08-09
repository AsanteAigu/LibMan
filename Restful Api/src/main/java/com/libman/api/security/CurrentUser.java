package com.libman.api.security;

import org.springframework.security.oauth2.jwt.Jwt;

/** Small helper so controllers don't repeat "parse the sub/role claim" everywhere. */
public class CurrentUser {

    private CurrentUser() {
    }

    public static Integer id(Jwt jwt) {
        return Integer.valueOf(jwt.getSubject());
    }

    public static String role(Jwt jwt) {
        return jwt.getClaimAsString("role");
    }

    public static boolean isLibrarian(Jwt jwt) {
        return "librarian".equals(role(jwt));
    }
}
