
#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Читаем сумму карт игрока
    let player_hand = sp1_zkvm::io::read::<u32>();
    // Читаем сумму карт дилера
    sp1_zkvm::io::commit(&player_hand);

    // Определяем победителя
    let result = if player_hand > 21 {
        0
    } else{
        1
    };

    // Пишем входные данные в публичный output (для доказательства)

    // Пишем результат (1 = победа игрока, 0 = победа дилера, 2 = проигрыш из-за Bust)
    sp1_zkvm::io::commit(&result);
}