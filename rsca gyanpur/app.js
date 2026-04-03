const form = document.getElementById('admissionForm');
const submitBtn = document.getElementById('submitBtn');
const btnLoader = document.getElementById('btnLoader');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const newApplicationBtn = document.getElementById('newApplicationBtn');

function validateEmail(email) {
  if (!email) return true;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateMobile(mobile) {
  const re = /^[0-9]{10}$/;
  return re.test(mobile);
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(el => {
    el.classList.remove('error');
  });
}

function showError(fieldId, message) {
  const errorEl = document.getElementById(fieldId + 'Error');
  const inputEl = document.getElementById(fieldId);
  if (errorEl) errorEl.textContent = message;
  if (inputEl) inputEl.classList.add('error');
}

function validateForm() {
  clearErrors();
  let isValid = true;

  const studentName = document.getElementById('studentName').value.trim();
  const dob = document.getElementById('dob').value;
  const gender = document.getElementById('gender').value;
  const classApplying = document.getElementById('classApplying').value;
  const parentName = document.getElementById('parentName').value.trim();
  const mobile = document.getElementById('mobile').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();

  if (!studentName) {
    showError('studentName', 'Full name is required');
    isValid = false;
  }

  if (!dob) {
    showError('dob', 'Date of birth is required');
    isValid = false;
  }

  if (!gender) {
    showError('gender', 'Please select gender');
    isValid = false;
  }

  if (!classApplying) {
    showError('classApplying', 'Please select a class');
    isValid = false;
  }

  if (!parentName) {
    showError('parentName', 'Parent/Guardian name is required');
    isValid = false;
  }

  if (!mobile) {
    showError('mobile', 'Mobile number is required');
    isValid = false;
  } else if (!validateMobile(mobile)) {
    showError('mobile', 'Enter a valid 10-digit mobile number');
    isValid = false;
  }

  if (email && !validateEmail(email)) {
    showError('email', 'Enter a valid email address');
    isValid = false;
  }

  if (!address) {
    showError('address', 'Full address is required');
    isValid = false;
  }

  if (!city) {
    showError('city', 'City is required');
    isValid = false;
  }

  return isValid;
}

function resetForm() {
  form.reset();
  clearErrors();
  errorMessage.classList.add('hidden');
  successMessage.classList.add('hidden');
  form.classList.remove('hidden');
  submitBtn.disabled = false;
  submitBtn.classList.remove('loading');
}

async function submitToAirtable(formData) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${encodeURIComponent(AIRTABLE_CONFIG.TABLE_NAME)}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      records: [{
        fields: {
          'Student Name': formData.studentName,
          'Date of Birth': formData.dob,
          'Gender': formData.gender,
          'Class Applying For': formData.classApplying,
          'Parent Name': formData.parentName,
          'Mobile Number': formData.mobile,
          'Email': formData.email || '',
          'Address': formData.address,
          'City': formData.city,
          'Previous School': formData.previousSchool || '',
          'Last Class Completed': formData.lastClassCompleted || '',
          'Timestamp': new Date().toISOString()
        }
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to submit application');
  }

  return response.json();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  submitBtn.disabled = true;
  submitBtn.classList.add('loading');
  errorMessage.classList.add('hidden');

  const formData = {
    studentName: document.getElementById('studentName').value.trim(),
    dob: document.getElementById('dob').value,
    gender: document.getElementById('gender').value,
    classApplying: document.getElementById('classApplying').value,
    parentName: document.getElementById('parentName').value.trim(),
    mobile: document.getElementById('mobile').value.trim(),
    email: document.getElementById('email').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    previousSchool: document.getElementById('previousSchool').value.trim(),
    lastClassCompleted: document.getElementById('lastClassCompleted').value
  };

  try {
    await submitToAirtable(formData);
    form.classList.add('hidden');
    successMessage.classList.remove('hidden');
  } catch (error) {
    errorText.textContent = error.message || 'Something went wrong. Please try again.';
    errorMessage.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  }
});

newApplicationBtn.addEventListener('click', resetForm);

document.querySelectorAll('input, select, textarea').forEach(input => {
  input.addEventListener('input', () => {
    const errorEl = document.getElementById(input.id + 'Error');
    if (errorEl) errorEl.textContent = '';
    input.classList.remove('error');
  });
});
