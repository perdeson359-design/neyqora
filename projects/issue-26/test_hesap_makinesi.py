from hesap_makinesi import calculate

def test_operations():
    assert calculate(10, "+", 5) == 15
    assert calculate(10, "-", 5) == 5
    assert calculate(10, "*", 5) == 50
    assert calculate(10, "/", 5) == 2

def test_zero_division():
    try:
        calculate(10, "/", 0)
    except ValueError:
        return
    raise AssertionError("Sıfıra bölme ValueError vermeli.")

if __name__ == "__main__":
    test_operations()
    test_zero_division()
    print("Tüm testler başarılı.")
