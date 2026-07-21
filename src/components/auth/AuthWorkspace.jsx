'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import JobfluencerLogo from '@/components/brand/JobfluencerLogo';
import { useAuth } from '@/context/AuthContext';
import styles from './AuthWorkspace.module.css';

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
  'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Lucknow',
  'Chandigarh', 'Goa', 'Kochi', 'Indore', 'Surat',
];

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09A6.3 6.3 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
      <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
    </svg>
  );
}

function AuthShell({ mode, children }) {
  const registerMode = mode === 'register';
  return (
    <div className={styles.shell}>
      <aside className={styles.storyPanel}>
        <Link href="/" className={styles.logoLink} aria-label="Jobfluencer home">
          <JobfluencerLogo theme="dark" />
        </Link>

        <div className={styles.storyContent}>
          <div className={styles.storyEyebrow}>{registerMode ? 'Join the network' : 'Workspace access'}</div>
          <h2>{registerMode ? 'Choose your side. Build better work together.' : 'Good work starts with the right connection.'}</h2>
          <div className={styles.flowLine} aria-hidden="true">
            <span>Brief</span><i /><span>Match</span><i /><span>Work</span>
          </div>

          <div className={styles.signalBoard}>
            <div><span>01</span><strong>Hirers</strong><small>Clear briefs. Better decisions.</small></div>
            <div><span>02</span><strong>Creators</strong><small>Relevant work. Visible talent.</small></div>
            <div><span>03</span><strong>Together</strong><small>One shared campaign record.</small></div>
          </div>
        </div>

        <div className={styles.storyFooter}>
          <ShieldCheck />
          <span><strong>Account protected</strong><small>Secure access to your Jobfluencer workspace.</small></span>
        </div>
      </aside>
      <main className={styles.formPanel}>{children}</main>
    </div>
  );
}

function SocialAccess({ action }) {
  const message = action === 'login' ? 'login' : 'sign-up';
  return (
    <div className={styles.socialGrid}>
      <button type="button" onClick={() => toast.info(`Google ${message} coming soon`)} data-testid={action === 'login' ? 'google-login-btn' : 'google-signup-btn'}>
        <GoogleMark /> Google
      </button>
      <button type="button" onClick={() => toast.info(`Facebook ${message} coming soon`)} data-testid={action === 'login' ? 'facebook-login-btn' : 'facebook-signup-btn'}>
        <FacebookMark /> Facebook
      </button>
    </div>
  );
}

function Divider() {
  return <div className={styles.divider}><i /><span>or continue with email</span><i /></div>;
}

export function LoginWorkspace() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success('Welcome back');
      router.push(user.role === 'brand' ? '/dashboard/brand' : '/dashboard/influencer');
    } catch (requestError) {
      const message = requestError.response?.data?.detail || 'We could not sign you in with those details.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell mode="login">
      <div className={styles.panelUtility}>
        <span>New to Jobfluencer?</span>
        <Link href="/register">Create account <ArrowRight /></Link>
      </div>

      <div className={styles.formWrap} data-testid="login-workspace">
        <button type="button" onClick={() => router.back()} className={styles.backAction} data-testid="back-btn"><ArrowLeft /> Back</button>
        <div className={styles.formHeading}>
          <span>Account checkpoint</span>
          <h1>Welcome back.</h1>
          <p>Enter the workspace where your campaigns and collaborations are already moving.</p>
        </div>

        <SocialAccess action="login" />
        <Divider />

        {error && <div className={styles.errorBanner} role="alert">{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Email address</span>
            <div className={styles.inputWrap}>
              <Mail />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                data-testid="login-email-input"
              />
            </div>
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <div className={styles.inputWrap}>
              <LockKeyhole />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                data-testid="login-password-input"
              />
              <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'} data-testid="login-toggle-password-btn">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>
          <button type="submit" className={styles.submitAction} disabled={loading} data-testid="login-submit-btn">
            {loading ? <LoaderCircle className={styles.spin} /> : <LockKeyhole />}
            {loading ? 'Opening workspace...' : 'Enter workspace'}
            {!loading && <ArrowRight />}
          </button>
        </form>

        <p className={styles.formFootnote}>By continuing, you are accessing your private Jobfluencer workspace.</p>
      </div>
    </AuthShell>
  );
}

export function RegisterWorkspace() {
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get('role');
  const role = requestedRole === 'brand' || requestedRole === 'creator' ? requestedRole : null;

  return (
    <AuthShell mode="register">
      {role ? <RegisterForm role={role} /> : <RoleSelector />}
    </AuthShell>
  );
}

function RoleSelector() {
  const router = useRouter();
  return (
    <>
      <div className={styles.panelUtility}>
        <span>Already have an account?</span>
        <Link href="/login">Log in <ArrowRight /></Link>
      </div>
      <div className={`${styles.formWrap} ${styles.formWide}`} data-testid="register-role-workspace">
        <button type="button" onClick={() => router.back()} className={styles.backAction} data-testid="back-btn"><ArrowLeft /> Back</button>
        <div className={styles.formHeading}>
          <span>Choose your workspace</span>
          <h1>How will you use Jobfluencer?</h1>
          <p>Your choice sets up the right dashboard, onboarding path, and working tools from the start.</p>
        </div>

        <div className={styles.roleLanes}>
          <Link href="/register?role=brand" className={`${styles.roleLane} ${styles.hirerLane}`} data-testid="role-brand-btn">
            <span className={styles.roleCode}>01 / Hirer</span>
            <span className={styles.roleIcon}><BriefcaseBusiness /></span>
            <span className={styles.roleCopy}>
              <strong>Build campaigns and hire creators.</strong>
              <small>For brands, agencies, founders, and hiring teams.</small>
            </span>
            <ArrowRight />
          </Link>
          <Link href="/register?role=creator" className={`${styles.roleLane} ${styles.creatorLane}`} data-testid="role-creator-btn">
            <span className={styles.roleCode}>02 / Creator</span>
            <span className={styles.roleIcon}><Users /></span>
            <span className={styles.roleCopy}>
              <strong>Find briefs and grow your body of work.</strong>
              <small>For influencers, photographers, editors, and creative talent.</small>
            </span>
            <ArrowRight />
          </Link>
        </div>
      </div>
    </>
  );
}

function RegisterForm({ role }) {
  const { register } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', city: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleDetails = role === 'brand'
    ? { label: 'Hirer', icon: BriefcaseBusiness, destination: '/onboarding/brand', title: 'Create your hirer account.', copy: 'Set up the workspace where your brand will brief, discover, and hire.' }
    : { label: 'Creator', icon: UserRound, destination: '/onboarding/creator', title: 'Create your creator account.', copy: 'Set up the profile brands will discover when they need your point of view.' };
  const RoleIcon = roleDetails.icon;
  const passwordScore = useMemo(() => {
    let score = 0;
    if (formData.password.length >= 6) score += 1;
    if (formData.password.length >= 10) score += 1;
    if (/[A-Z]/.test(formData.password) && /\d/.test(formData.password)) score += 1;
    return score;
  }, [formData.password]);

  const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and privacy policy');
      return;
    }
    if (!formData.city) {
      toast.error('Please select your city');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role,
        city: formData.city,
      });
      toast.success('Your account is ready');
      router.push(user.role === 'brand' ? '/onboarding/brand' : '/onboarding/creator');
    } catch (requestError) {
      const message = requestError.response?.data?.detail || 'We could not create this account.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.panelUtility}>
        <span>Already registered?</span>
        <Link href="/login">Log in <ArrowRight /></Link>
      </div>
      <div className={`${styles.formWrap} ${styles.registerFormWrap}`} data-testid="register-form-workspace">
        <Link href="/register" className={styles.backAction} data-testid="back-to-role-btn"><ArrowLeft /> Change role</Link>

        <div className={styles.roleBadge}><RoleIcon /><span><small>Workspace type</small><strong>{roleDetails.label}</strong></span><Check /></div>
        <div className={styles.formHeading}>
          <span>Account setup</span>
          <h1>{roleDetails.title}</h1>
          <p>{roleDetails.copy}</p>
        </div>

        <SocialAccess action="register" />
        <Divider />
        {error && <div className={styles.errorBanner} role="alert">{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.twoFields}>
            <label className={styles.field}>
              <span>First name</span>
              <div className={styles.inputWrap}><UserRound /><input value={formData.firstName} onChange={(event) => updateField('firstName', event.target.value)} autoComplete="given-name" required data-testid="register-firstname-input" /></div>
            </label>
            <label className={styles.field}>
              <span>Last name</span>
              <div className={styles.inputWrap}><UserRound /><input value={formData.lastName} onChange={(event) => updateField('lastName', event.target.value)} autoComplete="family-name" required data-testid="register-lastname-input" /></div>
            </label>
          </div>
          <label className={styles.field}>
            <span>Email address</span>
            <div className={styles.inputWrap}><Mail /><input type="email" value={formData.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@company.com" autoComplete="email" required data-testid="register-email-input" /></div>
          </label>
          <label className={styles.field}>
            <span>Create password</span>
            <div className={styles.inputWrap}>
              <LockKeyhole />
              <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(event) => updateField('password', event.target.value)} placeholder="At least 6 characters" minLength={6} autoComplete="new-password" required data-testid="register-password-input" />
              <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'} data-testid="toggle-password-btn">{showPassword ? <EyeOff /> : <Eye />}</button>
            </div>
            <span className={styles.passwordMeter}><i className={passwordScore >= 1 ? styles.meterActive : ''} /><i className={passwordScore >= 2 ? styles.meterActive : ''} /><i className={passwordScore >= 3 ? styles.meterActive : ''} /><small>{formData.password ? ['Keep going', 'Good', 'Strong'][Math.max(0, passwordScore - 1)] : 'Use 6 or more characters'}</small></span>
          </label>
          <label className={styles.field}>
            <span>Primary city</span>
            <div className={styles.inputWrap}>
              <MapPin />
              <select value={formData.city} onChange={(event) => updateField('city', event.target.value)} required data-testid="register-city-select">
                <option value="">Select your city</option>
                {CITIES.map((city) => <option value={city} key={city}>{city}</option>)}
              </select>
            </div>
          </label>

          <label className={styles.termsRow}>
            <input type="checkbox" checked={agreedToTerms} onChange={(event) => setAgreedToTerms(event.target.checked)} data-testid="terms-checkbox" />
            <span>I agree to the Jobfluencer User Agreement and Privacy Policy.</span>
          </label>

          <button type="submit" className={styles.submitAction} disabled={loading || !agreedToTerms} data-testid="register-submit-btn">
            {loading ? <LoaderCircle className={styles.spin} /> : <RoleIcon />}
            {loading ? 'Creating workspace...' : `Create ${roleDetails.label.toLowerCase()} account`}
            {!loading && <ArrowRight />}
          </button>
        </form>
      </div>
    </>
  );
}
