package com.libman.api.service;

import com.libman.api.repository.ChargeRepository;
import com.libman.api.web.dto.ChargeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChargeService {

    private final ChargeRepository chargeRepository;

    @Transactional(readOnly = true)
    public List<ChargeResponse> listForUser(Integer userId) {
        return chargeRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(ChargeResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ChargeResponse> listAll() {
        return chargeRepository.findAllByOrderByCreatedAtDesc().stream().map(ChargeResponse::from).toList();
    }
}
