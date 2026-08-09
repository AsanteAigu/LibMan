package com.libman.api.service;

import com.libman.api.domain.enums.UserRole;
import com.libman.api.exception.AppException;
import com.libman.api.repository.BorrowRequestRepository;
import com.libman.api.repository.ChargeRepository;
import com.libman.api.repository.LoanRepository;
import com.libman.api.repository.UserRepository;
import com.libman.api.web.dto.BorrowRequestResponse;
import com.libman.api.web.dto.ChargeResponse;
import com.libman.api.web.dto.LoanResponse;
import com.libman.api.web.dto.UserHistoryResponse;
import com.libman.api.web.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final ChargeRepository chargeRepository;

    @Transactional(readOnly = true)
    public List<UserResponse> search(String q, UserRole role) {
        return userRepository.search(q == null || q.isBlank() ? null : q, role == null ? null : role.name()).stream()
                .map(UserResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse get(Integer id) {
        return userRepository.findById(id).map(UserResponse::from).orElseThrow(() -> AppException.notFound("User"));
    }

    @Transactional(readOnly = true)
    public UserHistoryResponse getHistory(Integer id) {
        if (!userRepository.existsById(id)) {
            throw AppException.notFound("User");
        }
        return new UserHistoryResponse(
                loanRepository.findByUserIdOrderByHoldStartedAtDesc(id).stream().map(LoanResponse::from).toList(),
                borrowRequestRepository.findByUserIdOrderByRequestedAtDesc(id).stream().map(BorrowRequestResponse::from).toList(),
                chargeRepository.findByUserIdOrderByCreatedAtDesc(id).stream().map(ChargeResponse::from).toList()
        );
    }
}
