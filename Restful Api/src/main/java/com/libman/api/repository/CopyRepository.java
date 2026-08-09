package com.libman.api.repository;

import com.libman.api.domain.Copy;
import com.libman.api.domain.enums.CopyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CopyRepository extends JpaRepository<Copy, Integer> {

    List<Copy> findByTitleId(Integer titleId);

    List<Copy> findByTitleIdAndStatus(Integer titleId, CopyStatus status);

    long countByTitleIdAndStatus(Integer titleId, CopyStatus status);

    long countByStatus(CopyStatus status);

    /** Not row-locked: a true concurrent double-assignment is still caught safely at the
     * DB level by idx_loans_one_active_per_copy when the trigger inserts the loan. */
    Optional<Copy> findFirstByTitleIdAndStatus(Integer titleId, CopyStatus status);
}
