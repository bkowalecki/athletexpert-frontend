import React, { useState } from "react";
import "../styles/RegisterPage.css";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    favoriteSport: "",
    age: "",
    agreeToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
  
    // Check if the input type is a checkbox
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement; // Type assertion for checkboxes
      setFormData({
        ...formData,
        [name]: checked, // Handle checkbox values
      });
    } else {
      setFormData({
        ...formData,
        [name]: value, // Handle input/select values
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Submitted: ", formData);
  };

  return (
    <div className="register-page">
      <div className="register-header">
        <h1>Join AthleteXpert</h1>
        <p>Unlock your potential with the best gear, resources, and community for athletes.</p>
      </div>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="example@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="favoriteSport">Favorite Sport</label>
          <select
            id="favoriteSport"
            name="favoriteSport"
            value={formData.favoriteSport}
            onChange={handleInputChange}
            required
          >
            <option value="">Choose a sport</option>
            <option value="Basketball">Basketball</option>
            <option value="Soccer">Soccer</option>
            <option value="Tennis">Tennis</option>
            <option value="Running">Running</option>
            <option value="Swimming">Swimming</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="age">Age (optional)</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Your age"
          />
        </div>

        <div className="form-group form-checkbox">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="agreeToTerms">
            I agree to the <a href="/terms-and-conditions" target="_blank">Terms and Conditions</a>
          </label>
        </div>

        <button type="submit" className="submit-button">
          Register
        </button>
      </form>
      <p className="register-footer">
        Already have an account? <a href="/login">Log in here</a>
      </p>
    </div>
  );
};

export default RegisterPage;




