package com.st6.weeklycommit.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = FibonacciValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidFibonacci {
    String message() default "Must be a Fibonacci value (1, 2, 3, 5, 8, 13)";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
