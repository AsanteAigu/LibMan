package com.libman.api.repository;

import com.libman.api.domain.User;
import com.libman.api.domain.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRole(UserRole role);

    // :q and :role are cast explicitly -- otherwise Postgres can't infer their type from a bare
    // "IS NULL" / CONCAT/LOWER usage and errors with "could not determine data type of parameter".
    // :role is taken as its enum *name* (String), not the UserRole enum itself -- bound as a bare
    // JPQL parameter (outside the usual "compared directly to an entity attribute" context) Hibernate
    // has no reason to serialize it by name rather than ordinal, which silently matched zero rows.
    @Query("""
        SELECT u FROM User u
        WHERE (:q IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%'))
                          OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%')))
          AND (:role IS NULL OR CAST(u.role AS string) = :role)
        ORDER BY u.name
        """)
    List<User> search(String q, String role);
}
