<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ValidationLogicTest extends TestCase
{
    public function test_email_is_valid()
    {
        $email = "usuario@example.com";
        $isValid = filter_var($email, FILTER_VALIDATE_EMAIL);
        $this->assertNotFalse($isValid); 
    }

    public function test_email_is_invalid()
    {
        $email = "usuario@invalido";
        $isValid = filter_var($email, FILTER_VALIDATE_EMAIL);
        $this->assertFalse($isValid);
    }

    public function test_year_is_between_1900_and_current()
    {
        $anio = 1986;
        $currentYear = date('Y');
        $this->assertGreaterThanOrEqual(1900, $anio);
        $this->assertLessThanOrEqual($currentYear, $anio);
    }

    public function test_password_length_is_at_least_8_characters()
    {
        $password = "12345678";
        $this->assertGreaterThanOrEqual(8, strlen($password));
    }
}