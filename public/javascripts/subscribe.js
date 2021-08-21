new_subscription = function(param) {
  const body = JSON.stringify(param)
  const subscribe_request = new Request('/api/subscription/new', {
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

get_subscriptions = function(device_id) {
  const subscriptions_request = new Request('/api/subscription/'+device_id, {method: 'get'})
  fetch(subscriptions_request)
  .then(response => {
    if (response.status === 200) {
    return response.json();
    } else {
      throw new Error('Error in API request');
    }
    })
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.error(error);
    });
}

delete_subscription = function(id) {
  const delete_request = new Request('/api/subscription/delete/'+id, {
    method: 'post'
  });
  fetch(delete_request)
  .catch(err => {
    console.log('Error deleting subscription: '+id)
  })
}

const cancel_subscription = function(subscription_id, row_id) {
  delete_subscription(subscription_id)
  document.getElementById('subscriptions_table').deleteRow(row_id)
}
