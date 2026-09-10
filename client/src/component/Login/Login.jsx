import React, { useContext,useState } from 'react'
import './Login.css'
import cross_icon from '../../assets/cross_icon.png'
import { StoreContext } from '../../context/StoreContext'
import upload_area from '../../assets/upload_area.png'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = ({setShowLogin}) => {  
    const [image,setImage] = useState(false);
    const {url,setToken} = useContext(StoreContext)
    const[currState,setCurrState]=useState("Login")
    const [data,setData] = useState({
        name:"",
        phone:"",
        email:"",
        password:""
    });
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const onChangeHandler =(event)=>{
        const name = event.target.name;
        const value = event.target.value;
        setData(data=>({...data,[name]:value}));
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };
    const onLogin =async(event) =>{
        event.preventDefault()
        let newUrl = url;
        const formData = new FormData();
        if (currState==="Login"){
            newUrl += "/api/user/login";
            formData.append("email", data.email);
            formData.append("password", data.password);
        }else{
            newUrl += "/api/user/register";
            formData.append("name", data.name);
            formData.append("phone", data.phone);
            formData.append("email", data.email);
            formData.append("password", data.password);
            formData.append("image", image);
            if (data.password !== data.confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
        }
        try {
        const response = await axios.post(newUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response.data.success) {
            setToken(response.data.token);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userImage", response.data.image);
            toast.success('Login successfully');
            if (response.data.role === 'admin') {
                window.open('http://localhost:3003/', '_blank');
            }else{
                setShowLogin(false)
                navigate('/');
            }
        }else{
            toast.error(response.data.message || 'Failed to login/register. Please check your details and try again.');
        }
    } catch (error) {
        console.error('Login/Register error:', error);
        toast.error(error.response?.data?.message || 'Failed to login/register. Please check your details and try again.');
    }
};

  return (
    <div className='login'>
        <form onSubmit={onLogin} className='login-container'>
            <div className="login-title">
                <h2>{currState}</h2>
                <img onClick={()=>setShowLogin(false)}src={cross_icon} alt="Cross"/>
            </div>
            <div className="login-inputs">  
                {currState==="Login"?<></>:<>
                <center>
                    <label htmlFor='image'><img className=' profile-image rounded-lg' src={image?URL.createObjectURL(image):upload_area} alt=''/></label>
                    <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="image" required style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}/>
                </center>
                <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your Name' required/>
                <input name='phone' onChange={onChangeHandler} value={data.phone} type="tel" placeholder='Phone Number' pattern="[0-9]{10}" maxLength={10} title="Enter a valid 10-digit phone number" required/></>}  
                <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your Email' required/>
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <input name='password' onChange={onChangeHandler} value={data.password} type={showPassword?"text":"password"} placeholder='Enter password' required style={{ width: '100%', paddingRight: '40px' }}/>
                    <span onClick={togglePasswordVisibility} style={{position: 'absolute',right: 10,top: '50%',transform: 'translateY(-50%)',cursor: 'pointer'}}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                {currState !== "Login" && (
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <input name='confirmPassword' onChange={onChangeHandler} value={data.confirmPassword} type={showConfirmPassword ? "text" : "password"} placeholder='Confirm your Password' required style={{ width: '100%', paddingRight: '40px' }} />
                    <span onClick={toggleConfirmPasswordVisibility} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}>
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                )}
            </div>
            <div className="login-condition">
                <input type='checkbox'required/>
                <p>By continuing, I agree to the terms of use & privacy policy.</p>
            </div>
            <button type='submit'>{currState==="Sign Up"?"Sign Up":"Login"}</button>
            {currState==='Login'
            ?<p>Create a new Account? <span onClick={()=>setCurrState("Sign Up")}>Click here</span></p>
            :<p>Already have an account? <span onClick={()=>setCurrState("Login")}>Login here</span></p>
            }  
        </form>
    </div>
  )
}

export default Login