import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import VigioActivationForm from '../components/VigioActivationForm';

export default function ActivateProductPage(){
 const {token=''}=useParams();
 if(!/^[a-zA-Z0-9_-]{6,50}$/.test(token)) return <Navigate to="/panel" replace/>;
 return <VigioActivationForm token={token}/>;
}
