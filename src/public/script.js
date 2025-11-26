// Navigation Animation
const menu = document.querySelector('nav ul');
const menuBtn = document.querySelector('.menu-open');
const closeBtn = document.querySelector('.menu-close');

menuBtn.addEventListener('click', function(){
    menu.classList.add('open');
});

closeBtn.addEventListener('click', function(){
    menu.classList.remove('open');
});

function validateFeedback(){
    var feedback_name = document.getElementById("feedback-name");
    var feedback_email = document.getElementById("feedback-email");
    var feedback_text = document.getElementById("feedback-text");

    if (feedback_name.value === "" || feedback_email.value === "" || feedback_text.value === ''){
        alert("Please fill out all fields");
        return false;
    }
    return true;
}