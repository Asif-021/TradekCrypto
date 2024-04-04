import {firestore} from  '../app/db.js';
import { useState, useEffect} from  "react";
import { collection, getDocs, updateDoc, query, where} from 'firebase/firestore';
import "../styles/management.css";




function Management(props){
     
    const [waitingUsers, setWaitingUsers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentDOB, setCurrentDOB] = useState(null);
    const [age, setAge] = useState(0);

    // Get all users that are yet to be approved
    useEffect(() => {
        async function fetchUserInfo() {
            try{
                const q = query(collection(firestore, "User Info"), where('idURL', '!=', ""));
                const result = await getDocs(q);
                const userInfo = result.docs.map(doc => ({docID: doc.id, ...doc.data()}));
                setWaitingUsers(userInfo);
                console.log(waitingUsers)

                
            }
            catch(e){
                console.error("Error getting documents from Firestore (collection User Info): ", e)
            }
        }
        fetchUserInfo();
    }, []);

    const handleApprove = async (userDocID) => {
        await handleApproval(userDocID, true)
        nextUser();
    }

    const handleReject = async (userDocID) => {
        await handleApproval(userDocID, false)
        nextUser();
    }

    const handleApproval = async (userDocID, approved) => {
        const docRef = doc(firestore, "User Info", userDocID);
        await updateDoc(docRef, {approved: approved, approvedBy: (`${props.data.firstName} ${props.data.lastName}`)});
        if(!approved){
            await updateDoc(docRef, {rejected: true})
        }
    }

    const nextUser = () => {
        setCurrentIndex(c => c + 1);
    }

    const currentUser = waitingUsers[currentIndex];
    useEffect({
            // Set the DOB and Age
            if (currentUser){
                const date = currentUser.dob.toDate();
                const dob = `${date.getDate()}-${(date.getMonth()+1)}-${date.getYear()}`;
            }
    }), [currentUser];
    return(
        
        <>
        <div className="management-container">
            <h1>Management Panel</h1>
        </div>
        <div className="user-info">
            <h2>User Info</h2>
            <div className="info">
                {currentUser && <p id="name">{currentUser.firstName} {currentUser.lastName}</p>}
            </div>
            <img src={currentUser && currentUser.idURL} alt="Image of the users identification"  id="IDimage"/>
            <div className="interact-btns-container">
                <button id="approve-btn" onClick={() => handleApprove(currentUser.docID)}>Approve</button>
                <button id="reject-btn" onClick={() => handleReject(currentUser.docID)}>Reject</button>
            </div>
        </div>
        
        </>
    )
}


export default Management;