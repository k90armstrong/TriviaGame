$('document').ready(function () {
    // global variables
    var categories = [{
            name: 'Music',
            query: 'category=12'
        },
        {
            name: 'Film',
            query: 'category=11'
        },
        {
            name: 'Science and Nature',
            query: 'category=17'
        },
        {
            name: 'Science and Computers',
            query: 'category=18'
        },
        {
            name: 'Sports',
            query: 'category=21'
        }
    ];
    var difficulties = [{
            name: 'Easy',
            query: 'difficulty=easy',
        },
        {
            name: 'Medium',
            query: 'difficulty=medium',
        }, {
            name: 'Hard',
            query: 'difficulty=hard',
        }
    ]

    // class
    class TriviaQuestion {
        constructor(question, answer, fakeAnswers) {
            this.question = question;
            this.answer = answer;
            this.allAnswers = fakeAnswers; // this must be an array
            this.allAnswers.push(answer);
            // make the order random
            this.makeAnswersRandom();
        }
        makeAnswersRandom() {
            // jumble up the answers
            shuffle(this.allAnswers);
        }
    }

    // functions 
    // this is the fisher yates algorithm
    // used to shuffle an array
    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
    }

    function getCategoryObject(name) {
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].name === name) {
                return categories[i];
            }
        }
        return undefined;
    }

    function getDifficultyObject(name) {
        for (var i = 0; i < difficulties.length; i++) {
            if (difficulties[i].name === name) {
                return difficulties[i];
            }
        }
        return undefined;
    }

    function addCategoriesToSelection() {
        for (var i = 0; i < categories.length; i++) {
            var opt = $('<option>').text(categories[i].name);
            $('#subject-select').append(opt);
        }
    }

    // animation functions 
    function fadeIn($element, cb) {
        $element.css({
            opacity: '0'
        });
        $element.removeClass('display-none').animate({
            opacity: '1'
        }, 500).promise().done(function () {
            if (cb) {
                return cb()
            }
            return undefined
        });
    }

    function fadeOut($element, cb) {
        $element.css({
            opacity: '1'
        });
        $element.animate({
            opacity: '0'
        }, 500).promise().done(function () {
            if (cb) {
                return cb()
            }
            return undefined
        });
    }

    function animateQuestionChange($element, cb) {
        $element.addClass('animated bounceIn');
        setTimeout(function () {
            $element.removeClass('animated bounceIn');
            return (cb) ? cb() : undefined;
        }, 1500);
    }

    function animateAllQuestions() {
        animateQuestionChange(game.$answer1);
        animateQuestionChange(game.$answer2);
        animateQuestionChange(game.$answer3);
        animateQuestionChange(game.$answer4);
        animateQuestionChange(game.$question);
    }

    // objects
    var game = {
        startTime: 30,
        questionIndex: 0,
        timer: 30,
        wait: false,
        $timer: $('#timer-p'),
        $answer1: $('#ans-1'),
        $answer2: $('#ans-2'),
        $answer3: $('#ans-3'),
        $answer4: $('#ans-4'),
        $question: $('#question'),
        totalCorrect: 0,
        totalIncorrect: 0,
        currentCorrect: 0,
        currentIncorrect: 0,
        currentTrivia: undefined,
        allTrivias: [],
        timeIntreval: undefined,
        startTimer: function () {
            game.timer = game.startTime;
            game.updateTimer();
            game.timeIntreval = setInterval(function () {
                game.decrementTime();
            }, 1000);
        },
        stopTimer: function () {
            clearInterval(game.timeIntreval);
        },
        decrementTime: function () {
            game.timer -= 1;
            game.updateTimer();
            game.checkTime();
        },
        checkTime: function () {
            if (game.timer == 0) {
                game.totalIncorrect += 1;
                game.currentIncorrect += 1;
                game.stopTimer();
                game.showTooSlowSlider();
                game.showCorrect(game.getCorrectElement());
                setTimeout(function () {
                    game.hideSlider();
                    game.changeAllAnswersBack();
                    animateAllQuestions();
                    game.showCurrentQuestion();
                }, 5000);
            }
        },
        showTooSlowSlider: function () {
            $('.user-feedback').removeClass('display-none');
            $('#user-feedback-p').text('Times Up!');
            $('.user-feedback').removeClass('correct');
            $('.user-feedback').addClass('incorrect');
            $('.user-feedback').addClass('end');
            setTimeout(function () {
                $('#user-feedback-p').removeClass('display-none');
            }, 300);
        },
        hideSlider: function () {
            $('.user-feedback').removeClass('end');
            setTimeout(function () {
                $('#user-feedback-p').addClass('display-none');
                $('.user-feedback').addClass('display-none');
            }, 100);
        },
        showIncorrectSlider: function () {
            $('.user-feedback').removeClass('display-none');
            $('#user-feedback-p').text('That is incorrect!');
            $('.user-feedback').removeClass('correct');
            $('.user-feedback').addClass('incorrect');
            $('.user-feedback').addClass('end');
            setTimeout(function () {
                $('#user-feedback-p').removeClass('display-none');
            }, 300);
        },
        showCorrectSlider: function () {
            $('.user-feedback').removeClass('display-none');
            $('#user-feedback-p').text('That is Correct!');
            $('.user-feedback').addClass('correct');
            $('.user-feedback').removeClass('incorrect');
            $('.user-feedback').addClass('end');
            setTimeout(function () {
                $('#user-feedback-p').removeClass('display-none');
            }, 300);
        },
        updateTimer: function () {
            game.$timer.text(game.timer + ' s');
        },
        isAnswer: function (answer) {
            if (answer === game.answer) {
                return true
            }
            return false
        },
        getQuestions: function (cat, dif) {
            game.allTrivias = [];
            game.questionIndex = 0;
            // from the selections made get the questions
            var url = 'https://opentdb.com/api.php?amount=10&type=multiple';
            // append the categories and the difficulty to get 10 multiple choice questions
            console.log(cat, dif);
            var category = getCategoryObject(cat); // put name in function
            var difficulty = getDifficultyObject(dif); // put name of difficulty
            url = url + '&' + category.query;
            url = url + '&' + difficulty.query;
            $.ajax({
                url: url,
                method: 'GET'
            }).done(function (result) {
                // create all trivias and push all to game.allTrivias
                console.log(result);
                game.createAllTrivias(result.results);
                game.changeToStartOfGame();
                console.log(result);
            });

        },
        changeToStartOfGame: function () {
            game.stopTimer();
            fadeOut($('#selectTrivia'), () => {
                $('#selectTrivia').addClass('display-none');
                game.showCurrentQuestion();
                // change to first question
                fadeIn($('#game-area'), function () {
                    game.startTimer();
                });
            });
        },
        createAllTrivias: function (questionsArray) {
            for (var i = 0; i < questionsArray.length; i++) {
                var question = questionsArray[i];
                var triv = new TriviaQuestion(question.question, question.correct_answer, question.incorrect_answers);
                game.allTrivias.push(triv);
            }
        },
        showCurrentQuestion: function () {
            if (game.questionIndex < game.allTrivias.length) {
                game.currentTrivia = game.allTrivias[game.questionIndex];
                game.$answer1.html(game.currentTrivia.allAnswers[0]);
                game.$answer2.html(game.currentTrivia.allAnswers[1]);
                game.$answer3.html(game.currentTrivia.allAnswers[2]);
                game.$answer4.html(game.currentTrivia.allAnswers[3]);
                game.$question.html(game.currentTrivia.question);
                game.questionIndex += 1;
            } else {
                // game over, show the stats and a button to start over
                fadeOut($('#game-area'), function () {
                    $('#game-area').addClass('display-none');
                    $('#correct').text(game.currentCorrect);
                    $('#incorrect').text(game.currentIncorrect);
                    $('#percent').text(Math.floor(100 * game.totalCorrect / (game.totalIncorrect + game.totalCorrect)) + '%');
                    fadeIn($('#stats-view'));
                });
            }
        },
        changeAllAnswersBack: function () {
            game.$answer1.parent().removeClass('incorrect correct');
            game.$answer2.parent().removeClass('incorrect correct');
            game.$answer3.parent().removeClass('incorrect correct');
            game.$answer4.parent().removeClass('incorrect correct');
        },
        showCorrect: function ($element) {
            $element.parent().addClass('correct');
        },
        showIncorrect: function ($element) {
            $element.parent().addClass('incorrect');
        },
        getCorrectElement: function ($element) {
            switch (game.currentTrivia.answer) {
                case game.$answer1.html():
                    return game.$answer1
                case game.$answer2.html():
                    return game.$answer2
                case game.$answer3.html():
                    return game.$answer3
                case game.$answer4.html():
                    return game.$answer4
            }
        }

    }

    // event listeners
    $('#start-button').on('click', function () {
        var cat = $('#subject-select').find(':selected').text();
        var dif = $('#difficulty-select').find(':selected').text();
        game.getQuestions(cat, dif);

    });

    $('#play-again-button').on('click', function () {
        game.currentCorrect = 0;
        game.currentIncorrect = 0;
        fadeOut($('#stats-view'), function () {
            $('#stats-view').addClass('display-none');
            $('#welcome').text('Pick the same or other category and difficulty to test your knowledge again!');
            fadeIn($('#selectTrivia'));
        });
    });

    $('.pointer').on('click', function () {
        if (game.wait) {
            return
        }
        // stop the timer
        game.stopTimer();
        // get the text from the one clicked
        var $correct = game.getCorrectElement();
        var correctText = $correct.text();
        var textClicked = $(this).find('p').text();
        // check if it is the right answer
        if (textClicked === correctText) {
            // guessed right!
            game.totalCorrect += 1;
            game.currentCorrect += 1;
            game.showCorrectSlider();
            // if it was correct change that to green
            game.showCorrect(game.getCorrectElement());
        } else {
            // guess wrong
            game.totalIncorrect += 1;
            game.currentIncorrect += 1;
            game.showIncorrect($(this).find('p'));
            game.showIncorrectSlider();
            game.showCorrect(game.getCorrectElement());
            // show what was the right answer and make the one clicked on red
        }
        game.wait = true;
        // wait 5 seconds then go on to the next question
        setTimeout(function () {
            game.hideSlider();
            animateAllQuestions();
            game.changeAllAnswersBack();
            game.showCurrentQuestion();
            game.startTimer();
            game.wait = false;
        }, 3000);
    });



    // main process
    addCategoriesToSelection();











});