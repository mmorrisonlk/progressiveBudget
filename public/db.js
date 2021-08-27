let db;
let budgetVersion;

const request = indexedDB.open("BudgetDB", 25 || 21);

request.onupgradeneeded = function (e) {
  db = e.target.result;
  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetStore', { autoIncrement: true });
  }
};

request.onerror -
  function (e) {
    console.log(e.target.errorCode);
  };

function checkDatabase() {
  let transaction = db.transaction(['BudgetStore'], 'readwrite');
  const store = transaction.objectStore('BudgetStore');
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
        })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {

            transaction = db.transaction(['BudgetStore'], 'readwrite');

            const currentStore = transaction.objectStore('BudgetStore');

            currentStore.clear();
            console.log('Clearing store');
          }
        });
    }
  }
}

request.onsuccess = function (event) {
  console.log('success');
  db = event.target.result;

  if (navigator.onLine) {
    console.log('Back online!');
    checkDB();
  }
};

const saveRecord = (record) => {
  console.log('Record saved');

  const transaction = db.transaction(['BudgetStore'], 'readwrite');

  const store = transaction.objectStore('BudgetStore');

  store.add(record);
};

window.addEventListener('online', checkDB);