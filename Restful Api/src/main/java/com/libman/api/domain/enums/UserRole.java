package com.libman.api.domain.enums;

/**
 * Mirrors Postgres type user_role AS ENUM ('librarian', 'user').
 * Constants are lowercase (not the usual Java UPPER_SNAKE_CASE) on purpose:
 * mapped via @JdbcTypeCode(SqlTypes.NAMED_ENUM), which binds using name()
 * directly against the native Postgres enum label, and Postgres enum labels
 * are case-sensitive.
 */
public enum UserRole {
    librarian,
    user
}
