package com.st6.weeklycommit.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Set;

public class FibonacciValidator implements ConstraintValidator<ValidFibonacci, Integer> {

    private static final Set<Integer> FIBONACCI = Set.of(1, 2, 3, 5, 8, 13);

    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext context) {
        if (value == null) return true;
        return FIBONACCI.contains(value);
    }
}
