const { createApp } = Vue

createApp({
    data() {
        return {
            activeFrog: 'assets/frog-3_sleep.png',
            frogMessage: ["Z...Z...Z", "Привет", "Я жабий жаб", "Поздравляю тебя с днём рождения❤️💋🎊", ":)"],
            messageCount: 0,
            displayedText: "Z...Z...Z...", // Текст, который отображается посимвольно
            isSpeaking: false,
            isAnimating: false, // Флаг для анимации рта
            timeouts: [],
            typingInterval: null, // Интервал для печатания текста
        }
    },
    methods: {
        clearAllTimeouts() {
            this.timeouts.forEach(timeout => clearTimeout(timeout));
            this.timeouts = [];
        },

        clearAllIntervals() {
            if (this.typingInterval) {
                clearInterval(this.typingInterval);
                this.typingInterval = null;
            }
        },

        toggleFrog() {
            this.activeFrog = this.activeFrog == 'assets/frog-1_close_mouth.jpg'
                ? 'assets/frog-2_open_mouth.jpg'
                : 'assets/frog-1_close_mouth.jpg';
        },

        // Непрерывная анимация рта
        startMouthAnimation() {
            if (this.isAnimating) return;

            this.isAnimating = true;

            const animate = () => {
                if (!this.isAnimating) return;

                this.toggleFrog();

                // Продолжаем анимацию пока флаг активен
                this.timeouts.push(setTimeout(animate, 300));
            };

            // Запускаем анимацию
            this.timeouts.push(setTimeout(animate, 300));
        },

        stopMouthAnimation() {
            this.isAnimating = false;
            // Закрываем рот в конце
            this.activeFrog = 'assets/frog-1_close_mouth.jpg';
        },

        // Посимвольная печать текста
        async typeText(text, callback) {
            this.displayedText = "";

            return new Promise((resolve) => {
                let index = 0;

                this.typingInterval = setInterval(() => {
                    if (index < text.length) {
                        this.displayedText += text[index];
                        index++;
                    } else {
                        // Текст напечатан полностью
                        clearInterval(this.typingInterval);
                        this.typingInterval = null;
                        if (callback) callback();
                        resolve();
                    }
                }, 100); // Скорость печати - 100мс на символ
            });
        },

        async speakFrog() {
            // Если жаба говорит - игнорируем клик
            if (this.isSpeaking) {
                return;
            }

            this.isSpeaking = true;
            this.clearAllTimeouts();
            this.clearAllIntervals();

            // Определяем следующее сообщение
            const nextMessageIndex = this.messageCount + 1;

            // Если дошли до конца или жаба спит - начинаем сначала
            if (nextMessageIndex >= this.frogMessage.length || this.messageCount === 0) {
                this.messageCount = 1; // Пропускаем "Z...Z...Z", начинаем с "Привет"
            } else {
                this.messageCount = nextMessageIndex;
            }

            const currentMessage = this.frogMessage[this.messageCount];

            // Меняем картинку на закрытый рот перед началом разговора
            this.activeFrog = 'assets/frog-1_close_mouth.jpg';

            // Небольшая задержка перед началом
            await new Promise(resolve => setTimeout(resolve, 100));

            // Запускаем анимацию рта
            this.startMouthAnimation();

            // Запускаем печать текста
            await this.typeText(currentMessage);

            // Текст напечатан, останавливаем анимацию рта
            this.stopMouthAnimation();

            // Если это было последнее сообщение
            if (this.messageCount >= this.frogMessage.length - 1) {
                // Ждем немного и засыпаем
                setTimeout(() => {
                    this.messageCount = 0;
                    this.displayedText = "Z...Z...Z...";
                    this.activeFrog = 'assets/frog-3_sleep.png';
                    this.isSpeaking = false;
                }, 1000);
            } else {
                // Просто заканчиваем разговор
                setTimeout(() => {
                    this.isSpeaking = false;
                }, 500);
            }
        },
    }
}).mount('#app')