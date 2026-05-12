<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class UrlHelperTest extends TestCase
{
    public function test_valid_http_url()
    {
        $url = "http://localhost:3000/saved-searches";
        $isValid = filter_var($url, FILTER_VALIDATE_URL);
        $this->assertNotFalse($isValid); // filter_var devuelve la URL si es válida, false si no
    }

    public function test_valid_https_url()
    {
        $url = "https://api.omdbapi.com";
        $isValid = filter_var($url, FILTER_VALIDATE_URL);
        $this->assertNotFalse($isValid);
    }

    public function test_invalid_url()
    {
        $url = "not-a-url";
        $isValid = filter_var($url, FILTER_VALIDATE_URL);
        $this->assertFalse($isValid);
    }

    public function test_url_contains_expected_domain()
    {
        $url = "http://127.0.0.1:8001/api/peliculas";
        $contains = strpos($url, "127.0.0.1") !== false;
        $this->assertTrue($contains);
    }
}