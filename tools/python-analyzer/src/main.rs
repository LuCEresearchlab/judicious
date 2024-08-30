fn main() {
    println!("{:?}", python_analyzer::defined_functions("
def f():
    print(1)
    print(2)
def g():
    pass
x = 1"));
}