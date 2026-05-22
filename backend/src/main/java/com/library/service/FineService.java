package com.library.service;

import com.library.model.Fine;
import com.library.repository.FineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FineService {

    @Autowired
    private FineRepository fineRepository;

    public List<Fine> getAllFines() {
        return fineRepository.findAll();
    }

    public List<Fine> getFinesForUser(Long userId) {
        return fineRepository.findByUserId(userId);
    }

    public List<Fine> getUnpaidFines(Long userId) {
        return fineRepository.findByUserIdAndPaid(userId, false);
    }

    public Optional<Fine> getFineById(Long id) {
        return fineRepository.findById(id);
    }

    public Fine payFine(Long fineId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found: " + fineId));
        if (fine.isPaid()) {
            throw new RuntimeException("Fine is already paid.");
        }
        fine.markAsPaid();
        return fineRepository.save(fine);
    }
}
