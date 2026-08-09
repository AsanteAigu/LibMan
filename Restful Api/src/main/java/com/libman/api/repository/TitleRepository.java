package com.libman.api.repository;

import com.libman.api.domain.Title;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TitleRepository extends JpaRepository<Title, Integer> {

    // :q is cast explicitly -- otherwise Postgres can't infer its type from a bare
    // CONCAT/LOWER usage and errors with "function lower(bytea) does not exist".
    @Query("""
        SELECT t FROM Title t
        WHERE :q IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%'))
                          OR LOWER(t.author) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%'))
        ORDER BY t.name
        """)
    List<Title> search(String q);
}
