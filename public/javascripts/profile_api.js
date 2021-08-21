new_profile = function(param) {
  const body = JSON.stringify(param)
  const subscribe_request = new Request('/api/profile/new', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  });
  fetch(subscribe_request)
  .then(response => {
    return response.json
  })
  .catch(err => {
    console.log(err)
    return err
  })
};

get_profile = function() {
  return new Promise((resolve, reject) => {
    const profile_request = new Request('/api/profile/', {
      method: 'get',
    });
    fetch(profile_request)
    .then(response => {
      if (response.status === 200) {
      return response.json();
      } else {
        throw new Error('Error in API request');
      }
      })
      .then(response => {
        //console.log(response)
        resolve(response);
      })
      .catch(error => {
        console.error(error)
        reject(error);
      });
  })
}

update_profile = function(param) {
  const body = JSON.stringify(param)
  const subscribe_request = new Request('/api/profile/update', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  });
  fetch(subscribe_request)
  .then(response => {
    return response.json
  })
  .catch(err => {
    console.log(err)
    return err
  })
};
