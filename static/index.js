document.addEventListener('DOMContentLoaded', () => {

    if(localStorage.getItem('users'))
    {
          window.location.replace('/home');
    }

    document.querySelector('.login-form').onsubmit = ()=>{
      const userid = document.querySelector("#userid").value;
      localStorage.setItem('users', userid);
    };
});
