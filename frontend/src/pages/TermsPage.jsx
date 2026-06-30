import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="page-container page-container--narrow">
      <div className="page-header">
        <h1>Terms of Service</h1>
        <p className="page-subtitle">Last updated: June 30, 2026</p>
      </div>

      <div className="static-content animate-fade-in">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            Welcome to Showcase, the Student Project Showcase Portal. By accessing or using our platform,
            you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2>2. User Roles and Registration</h2>
          <p>
            Showcase provides different accounts based on role:
          </p>
          <ul>
            <li><strong>Students:</strong> Can upload, edit, and delete their own project portfolios.</li>
            <li><strong>Recruiters:</strong> Can follow students and like projects to bookmark talent.</li>
            <li><strong>Admins:</strong> Moderate projects and users to maintain a safe platform.</li>
          </ul>
        </section>

        <section>
          <h2>3. Project Submissions & Content</h2>
          <p>
            Students retain all ownership rights to the projects they upload. By submitting a project,
            you grant Showcase a non-exclusive license to display, promote, and share your project details
            on the platform for educational and recruitment purposes.
          </p>
        </section>

        <section>
          <h2>4. Content Moderation</h2>
          <p>
            Showcase administrators reserve the right to remove any project, submission, or user profile
            deemed inappropriate, plagiarized, or in violation of university guidelines.
          </p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>
            The platform is provided "as is" for demonstration and educational purposes. Showcase is not
            liable for any recruitment outcomes, code defects in submissions, or connectivity issues.
          </p>
        </section>

        <div className="static-footer">
          <Link to="/login" className="btn btn--secondary">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
