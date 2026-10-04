import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const EnhancedNavHeader = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const adminProfilePicture = searchParams.get('adminprofilePicture');
  const adminLogoImage = searchParams.get('adminlogoImage');
  const userFullName = searchParams.get('userFullName');
  const className = searchParams.get('className');

  useEffect(() => {
    console.log(adminProfilePicture);
    console.log(adminLogoImage);
    console.log(userFullName);
    console.log(className);
  }, []);

  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  let { userId, colorCode, entranceExamId, entranceExamName } =
    useParams();

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setDropdownOpen(false);
    }
  };
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  const goBack = () => {
    window.history.back();
  };
  const logout = () => {
    sessionStorage.clear();
    window.location.href = 'https://elitecodo.com/';
  };
  // Inline styles for when Tailwind isn't rendering
  const styles = {
    container: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
    navbar: {
      width: '100%',
      backgroundColor: 'white',
      borderBottom: '1px solid #E5E7EB',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    },
    navContent: {
      maxWidth: '1024px',
      margin: '0 auto',
      padding: '6px 35px',
    },
    navInner: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '64px',
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    backButton: {
      borderRadius: '10px',
      padding: '0.5rem',
      color: '#3B82F6',
      transition: 'all 0.2s',
      border: '1px solid #3B82F6',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    logo: {
      height: '40px',
      width: '40px',
    },
    className: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    userName: {
      fontWeight: 500,
    },
    notificationContainer: {
      position: 'relative',
    },
    notificationButton: {
      padding: '0.5rem',
      color: '#4B5563',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
    },
    notificationBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
      height: '20px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      color: 'white',
      backgroundColor: '#EF4444',
      borderRadius: '50%',
    },
    profileDropdown: {
      position: 'relative',
    },
    profileButton: {
      display: 'flex',
      alignItems: 'center',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '.5rem 1rem',
    },
    profileImage: {
      height: '36px',
      width: '36px',
      borderRadius: '50%',
      objectFit: 'cover',
    },
    dropdown: {
      position: 'absolute',
      right: 0,
      marginTop: '0.5rem',
      width: '12rem',
      backgroundColor: 'white',
      borderRadius: '0.375rem',
      boxShadow:
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '0.25rem 0',
      zIndex: 50,
    },
    dropdownItem: {
      display: 'block',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      color: '#374151',
      textDecoration: 'none',
      cursor: 'pointer',
    },
    divider: {
      borderTop: '1px solid #F3F4F6',
      margin: '0.25rem 0',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      backgroundColor: 'white',
      color: '#EF4444',
      border: '1px solid #EF4444',
      padding: '0.5rem 1rem',
      borderRadius: '10px',
      transition: 'all 0.2s',
      cursor: 'pointer',
    },
    hidden: {
      display: 'none',
    },
  };
  // Add hover effects
  useEffect(() => {
    const backButton = document.getElementById('backButton');
    const logoutButton = document.getElementById('logoutButton');
    if (backButton) {
      backButton.addEventListener('mouseover', () => {
        backButton.style.backgroundColor = '#3B82F6';
        backButton.style.color = 'white';
      });
      backButton.addEventListener('mouseout', () => {
        backButton.style.backgroundColor = 'transparent';
        backButton.style.color = '#3B82F6';
      });
    }
    if (logoutButton) {
      logoutButton.addEventListener('mouseover', () => {
        logoutButton.style.backgroundColor = '#EF4444';
        logoutButton.style.color = 'white';
      });
      logoutButton.addEventListener('mouseout', () => {
        logoutButton.style.backgroundColor = 'white';
        logoutButton.style.color = '#EF4444';
      });
    }
    // Media query for responsive design
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleResize = (e) => {
      const userNameElement = document.getElementById('userName');
      const logoutButtonElement =
        document.getElementById('logoutButton');
      if (userNameElement && logoutButtonElement) {
        if (e.matches) {
          userNameElement.style.display = 'none';
          logoutButtonElement.style.display = 'none';
        } else {
          userNameElement.style.display = 'block';
          logoutButtonElement.style.display = 'flex';
        }
      }
    };
    mediaQuery.addEventListener('change', handleResize);
    handleResize(mediaQuery);
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
      if (backButton) {
        backButton.removeEventListener('mouseover', () => {});
        backButton.removeEventListener('mouseout', () => {});
      }
      if (logoutButton) {
        logoutButton.removeEventListener('mouseover', () => {});
        logoutButton.removeEventListener('mouseout', () => {});
      }
    };
  }, []);
  return (
    <div style={styles.container}>
      {/* Main navigation bar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.navInner}>
            {/* Left section with back button and logo */}
            <div style={styles.leftSection}>
              <button
                id='backButton'
                // onClick={goBack}
                onClick={() =>
                  (window.location.href = `http://elitecodo.com/teacher/${entranceExamName}/dashboard`)
                }
                style={styles.backButton}
              >
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M15 18L9 12L15 6'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
              <div style={styles.logoContainer}>
                <div>
                  <img
                    src={adminLogoImage}
                    alt='Logo'
                    style={styles.logo}
                  />
                </div>
                <span style={styles.className}>{className}</span>
              </div>
            </div>
            {/* Right section with user info and actions */}
            <div style={styles.rightSection}>
              <span id='userName' style={styles.userName}>
                {userFullName}
              </span>
              {/* Notification bell */}
              {/* <div style={styles.notificationContainer}>
                <button style={styles.notificationButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {unreadNotifications > 0 && (
                    <span style={styles.notificationBadge}>
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </div> */}
              {/* Profile dropdown */}
              <div style={styles.profileDropdown} ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  style={styles.profileButton}
                >
                  <img
                    src={adminProfilePicture}
                    alt='Profile'
                    style={styles.profileImage}
                  />
                </button>
                {dropdownOpen && (
                  <div style={styles.dropdown}>
                    <a
                      href='#'
                      onClick={goBack}
                      style={styles.dropdownItem}
                    >
                      Go Back
                    </a>
                    <div style={styles.divider}></div>
                    <a
                      href='#'
                      onClick={logout}
                      style={styles.dropdownItem}
                    >
                      Log Out
                    </a>
                  </div>
                )}
              </div>
              {/* Log out button */}
              <button
                id='logoutButton'
                onClick={logout}
                style={styles.logoutButton}
              >
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M16 17l5-5-5-5'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M21 12H9'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};
export default EnhancedNavHeader;
