# On The Quizz
*When you need quizzes on the go !*

### [Tool link](https://clement-gouin.github.io/on-the-quizz/)

## Data format

Format is made line by line

Header (3-5 lines):
```txt
1   Quizz name (html, <h1> on plain text)
2   Correct answer (html, <h2> on plain text)
3   Incorrect answer (html, <h2> on plain text)
4?  Submit button text (html, optional)
5?  Retry button text (html, optional)
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

## Samples

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

```txt
<h1><i icon=notebook-pen></i> Rick Astley Quizz</h1>
<h2><i icon=trophy></i> You know your stuff !</h2>
<h2><i icon=x></i> Try again !</h2>
<i icon=check></i> Validate my response
<i icon=rotate-ccw></i> I want to retry
4
<big><b><i icon=baby></i></b></big> What year was Rick born?
1966
1959
1970
1964
4
<big><b><i icon=mic-vocal></i></b></big> What year was recorded <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Never Gonna Give You Up</a>?
1987
1986
1985
1988
4
<big><b><i icon=youtube></i></b></big> How many views has the clip on YouTube?
1.600.000
1.900.000
2.500.000
3.300.000
```

## Tips

* [Material design colors](https://materialui.co/colors/) are available, you can use `class="red-500"` on your HTML
* [Lucide icons](https://lucide.dev/icons) are available, you can use `<i icon=house></i>` on your HTML