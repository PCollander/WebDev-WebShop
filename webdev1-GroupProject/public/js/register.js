const regForm = document.getElementById('register-form');
const containerId = 'notifications-container';

/**
 * 
 * Listens to the submit button in order to catch registration submissions,
 * check if the information provided is okay in all ways.
 * 
 */

regForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const psWrd = document.getElementById('password').value;
  const confPsWrd = document.getElementById('passwordConfirmation').value;

  if (psWrd !== confPsWrd) {
    createNotification(
      "The password doesn't match with the password confirmation!",
      containerId,
      false
    );
  } else {
    const elements = regForm.querySelectorAll('input');
    const obj = {};
    elements.forEach((item) => { obj[item.name] = item.value })

    postOrPutJSON('/api/register', 'POST', obj)
      .then(() => {
        createNotification('Successfull registration!', containerId, true);
        regForm.reset();
      })
      .catch(err =>
        createNotification(
          `Registration error: ${err.error}`,
          containerId,
          false
        )
      );
  }
});
