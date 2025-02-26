# On The Quizz
*When you need quizzes on the go !*

### [Tool link](https://clement-gouin.github.io/on-the-quizz/)

## Data format

Format is made line by line

Header (3 lines):
```txt
1   Quizz name (html, <h1> on plain text)
2   Correct answer (html, <h2> on plain text)
3   Incorrect answer (html, <h2> on plain text)
```

After that each question is defined as follows:
```txt
1   Number of choices (0+)
2   Label (html)
3?  Correct choice
4*  Incorrect choices
```

Depending on the number of choices:
* 0: just a label (no need for correct choice line)
* 1: a text input field, the correct choice being the expected answer
* 2-4: a radio input field
* 5+: a dropdown input field

## Sample

```txt
My Quizz
<h2>Have a <a href='https://orteil.dashnet.org/cookieclicker/'>cookie</a> !</h2>
Try again !
0
This is just a <b>label</b>
1
This a text input (answer: answer)
answer
2
This is a multi-choice input
right
wrong
```

## Tips

* [Material design colors](https://materialui.co/colors/) are available, you can use `class="red-500"` on your HTML
* [FontAwesome icons](https://fontawesome.com/search?ic=free) are available, you can use `<i class="fas fa-house"></i>` on your HTML