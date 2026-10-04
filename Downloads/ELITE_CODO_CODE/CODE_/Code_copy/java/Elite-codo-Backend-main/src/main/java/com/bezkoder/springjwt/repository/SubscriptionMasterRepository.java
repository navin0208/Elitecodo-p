package com.bezkoder.springjwt.repository;

import com.bezkoder.springjwt.models.SubscriptionMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionMasterRepository extends JpaRepository<SubscriptionMaster, Long> {

    Optional<SubscriptionMaster> findByUserId(Long userId);
}