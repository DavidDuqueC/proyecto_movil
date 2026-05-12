<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class BasicTest extends TestCase
{
    public function test_suma()
    {
        $resultado = 2 + 2;
        $this->assertEquals(4, $resultado);
    }

    public function test_string_concatenation()
    {
        $nombre = "Blue";
        $apellido = "Velvet";
        $titulo = $nombre . " " . $apellido;
        $this->assertEquals("Blue Velvet", $titulo);
    }

    public function test_array_contains_value()
    {
        $generos = ['Misterio', 'Suspenso', 'Crimen'];
        $this->assertContains('Suspenso', $generos);
        $this->assertCount(3, $generos);
    }
}