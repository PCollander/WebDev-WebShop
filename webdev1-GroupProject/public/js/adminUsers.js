const usersContainer = document.getElementById('users-container');
const userTemplate = document.querySelector('#user-template');
const formContainer = document.getElementById('modify-user');
const formTemplate = document.querySelector('#form-template');
const containerId = 'notifications-container';

/**
 * Presents the users for the Admin user
 * 
 * */

const showUsers = async () => {
  const resourceURI = '/api/users';
  const jsonData = await getJSON(resourceURI);

  await jsonData.forEach(user => {
    const tClone = userTemplate.content.cloneNode(true);

    const row = tClone.querySelector('.item-row');
    row.id = `user-${user._id}`;

    const name = tClone.querySelector('.user-name');
    name.innerHTML = user.name;
    name.id = `name-${user._id}`;

    const email = tClone.querySelector('.user-email');
    email.innerHTML = user.email;
    email.id = `email-${user._id}`;

    const role = tClone.querySelector('.user-role');
    role.innerHTML = user.role;
    role.id = `role-${user._id}`;

    const modifyBtn = tClone.querySelector('.modify-button');
    modifyBtn.id = `modify-${user._id}`;

    const deleteBtn = tClone.querySelector('.delete-button');
    deleteBtn.id = `delete-${user._id}`;

    usersContainer.appendChild(tClone);
  });
};

/**
 * 
 * Listens to the buttons 'delete' and 'modify' and acts accordingly
 * 
 */

showUsers().then(() => {
  document.querySelectorAll('.delete-button').forEach(btn => {
    btn.addEventListener('click', function (event) {
      const delTarget = event.target;
      const delId = delTarget.id;
      const userId = delId.substring(7, delId.length);

      deleteResource(`/api/users/${userId}`)
        .then(() => {
          const delName = usersContainer.querySelector(`#name-${userId}`)
            .innerHTML;
          createNotification('Deleted user ' + delName, containerId, true);
          removeElement('users-container', `user-${userId}`);
          resetEditForm();
        })
        .catch(err =>
          createNotification(`Deletion unsuccesful: ${err}`, containerId, false)
        );
    });
  });

  document.querySelectorAll('.modify-button').forEach(btn => {
    btn.addEventListener('click', function (event) {
      const modTarget = event.target;
      const modId = modTarget.id;
      const userId = modId.substring(7, modId.length);
      const fClone = formTemplate.content.cloneNode(true);

      populateEditForm(userId, fClone);
      formContainer.appendChild(fClone);
      const editForm = document.getElementById('edit-user-form');

      editForm.addEventListener('submit', function (event1) {
        event1.preventDefault();
        const elements = event1.target.querySelectorAll('input');
        const selectRole = event1.target.querySelector('select');
        const obj = {};
        elements.forEach((item) => { obj[item.name] = item.value })
        obj[selectRole.name] = selectRole.value;
        postOrPutJSON(`/api/users/${userId}`, 'PUT', obj)
          .then(userResponse => {
            updateUser(userId, userResponse);
            const modName = usersContainer.querySelector(`#name-${userId}`)
              .innerHTML;
            createNotification('Updated user ' + modName, containerId, true);
            resetEditForm();
          })
          .catch(err =>
            createNotification(
              `Update unsuccesful: ${err.error}`,
              containerId,
              false
            )
          );
        resetEditForm();
      });
    });
  });
});

/**
 * Resets the edit form by removing the 'modify' elements from the form
 * 
 * */

const resetEditForm = () => {
  removeElement('modify-user', 'edit-user-form');
};

/**
 * 
 * Updates the name, email and role of the user targeted
 * 
 * @param {string} userId
 * @param {object} newValues
 */

const updateUser = (userId, newValues) => {
  const oldUser = usersContainer.querySelector(`#user-${userId}`);
  const name = oldUser.querySelector('.user-name');
  name.innerHTML = newValues.name;
  const email = oldUser.querySelector('.user-email');
  email.innerHTML = newValues.email;
  const role = oldUser.querySelector('.user-role');
  role.innerHTML = newValues.role;
};

/**
 * 
 * Populates the edit form with the data of the chosen user
 * 
 * @param {string} userId
 * @param {HTMLTemplateElement} fClone
 * 
 */

const populateEditForm = (userId, fClone) => {
  const populId = userId;
  const populName = usersContainer.querySelector(`#name-${userId}`).innerHTML;
  const populEmail = usersContainer.querySelector(`#email-${userId}`).innerHTML;
  const populRole = usersContainer.querySelector(`#role-${userId}`).innerHTML;

  const newHeader =
    fClone.querySelector('h2').innerHTML.substring(0, 12) + populName;
  fClone.childNodes[1].querySelector(
    '.text-align-center'
  ).innerHTML = newHeader;

  fClone.getElementById('id-input').value = populId;
  fClone.getElementById('name-input').value = populName;
  fClone.getElementById('email-input').value = populEmail;
  fClone.getElementById('role-input').value = populRole;
};
