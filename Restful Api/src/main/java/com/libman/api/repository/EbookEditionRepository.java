package com.libman.api.repository;

import com.libman.api.domain.EbookEdition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface EbookEditionRepository extends JpaRepository<EbookEdition, Integer> {

    Optional<EbookEdition> findByTitleId(Integer titleId);

    boolean existsByTitleId(Integer titleId);

    @Query("SELECT e.title.id FROM EbookEdition e WHERE e.title.id IN :titleIds")
    Set<Integer> findTitleIdsWithEbook(List<Integer> titleIds);
}
