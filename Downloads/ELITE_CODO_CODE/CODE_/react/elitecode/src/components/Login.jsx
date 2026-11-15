// import {
//   HttpsOutlined,
//   PersonOutline,
//   Visibility,
//   VisibilityOff,
// } from '@mui/icons-material';
import React from 'react';
import { useState } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import facebook1 from '../Auth/facebook1.png';
// import twit from '../Auth/twit.png';
// import google from '../Auth/google1.jpeg';
// import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../axios';



const Login = () => {
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passVisible, setPassVisible] = useState(false);
  const [ucolors, setUColors] = useState('');
  const [pcolors, setPColors] = useState('');
  const [isClicked, setIsClicked] = useState('');
  const [isClickedP, setIsClickedP] = useState('');
  const navigate = useNavigate();

  const handleColor = () => {
    setUColors(true);
    setIsClicked(true);
  };
  const handleColors = () => {
    setUColors(false);
    setIsClicked(false);
  };
  const handleUsernameFocus = () => {
    setIsUsernameFocused(true);
  };
  const handleUsernameBlur = () => {
    setIsUsernameFocused(false);
  };
  const handleColorP = () => {
    setPColors(true);
    setIsClickedP(true);
  };
  const handleColorsP = () => {
    setPColors(false);
    setIsClickedP(false);
  };
  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
  };
  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
  };
  const visible = () => {
    setPassVisible(!passVisible);
  };

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      if (!userName || !password) {
        return;
      }
      const deviceId = localStorage.getItem('deviceId') || 'web_react_' + Date.now();
      localStorage.setItem('deviceId', deviceId);

      const response = await httpClient.post(
        '/api/auth/signin',
        {
          username: userName,
          password: password,
          role: 'TEACHER',
          deviceId: deviceId,
          forceLogout: true,
        }
      );
      console.log('Backend Response:', response.data);
      if (response.data && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data));
        const teacherId = response.data.id || 7;
        navigate(`/create-question/default/1/Exam_Ash/${teacherId}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + (error?.response?.data?.message || error.message));
    }
  };

  return (
    <div className=' flex justify-center items-center poppins logform h-[100vh] bg-[url("assets/icons/bg3.jpg")] bg-cover mx-[auto] p-[20px]'>
      <div className=' w-[348px] pb-[60px] pt-[30px] lg:w-[502px] bg-[white] m-[auto] rounded-lg  '>
        <h1 className='text-[40px] font-light text-center'>Login</h1>
        <p className='text-[15px] text-[#3A3B3C] font-normal mt-[54px] ml-[27px] lg:ml-[53px]'>
          Username
        </p>
        <div
          className={`logforminput flex lg:ml-[53px] lg:w-[395px]  
          ${isClicked ? 'border-[#8C8C8C]' : ' border-[#CECECE]'}`}
          onFocus={handleColor}
          onBlur={handleColors}
        >
          {/* <PersonOutline
            className='mt-[13px] ml-[10px]'
            style={{ color: ucolors ? 'purple' : 'gray' }}
          /> */}
          <input
            type='text'
            value={userName}
            className='input w-[100%] h-[44px] border border-[#757575]'
            placeholder={
              isUsernameFocused ? '' : '  Type your username'
            }
            onFocus={handleUsernameFocus}
            onBlur={handleUsernameBlur}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <p className='text-[15px] text-[#3A3B3C] font-normal mt-[26px] ml-[27px] lg:ml-[53px]'>
          Password
        </p>
        <div
          className={`logforminput flex lg:ml-[53px] lg:w-[395px]  
          ${isClickedP ? 'border-[#8C8C8C]' : ' border-[#CECECE]'}`}
          onFocus={handleColorP}
          onBlur={handleColorsP}
        >
          {/* <HttpsOutlined
            className='mt-[13px] ml-[10px]'
            style={{ color: pcolors ? 'purple' : 'gray' }}
          /> */}
          <input
            type={passVisible ? 'text' : 'password'}
            value={password}
            className='input w-[100%] h-[44px] border border-[#757575]'
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
            placeholder={
              isPasswordFocused ? '' : '  Type your password'
            }
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* <button onClick={visible}>
                        {passVisible ? <Visibility style={{ color: "gray" }} /> : <VisibilityOff style={{ color: "gray" }} />}</button> */}
        </div>
        <p
          className='text-[#797979] lg:text-[16px] text-[14px] font-normal ml-[190px]
            lg:ml-[300px] mt-[15px] cursor-pointer hover:text-[purple]'
        >
          Forgot Password?
        </p>
        <button
          className=' bg-[url("assets/icons/bg3.jpg")] bg-cover h-[52px] lg:w-[390px] w-[291px] rounded-full lg:ml-[50px] ml-[27px] mt-[30px]
             text-[white] text-[18px] font-bold '
          onClick={handleLogin}
        >
          LOGIN
        </button>
        {/* <ToastContainer closeOnClick={false} /> */}
      </div>
    </div>
  );
};

export default Login;
