import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import BeyondLifePremium from "./Components/Home/LandingPage";
import { ToastContainer } from "react-toastify";
import AuthPage from "./Components/Home/AuthPage";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import CustomersPage from "./Components/Admin/CustomersPage";
import DocumentsPage from "./Components/Admin/DocumentsPage.JSX";
import NomineeApprovalPage from "./Components/Admin/NomineeApprovalPage";
import AssignedNomineesPage from "./Components/Admin/AssignedNomineesPage";
import UserDashboard from "./Components/User/UserDashboard";
import UploadWill from "./Components/User/UploadWill";
import ViewWills from "./Components/User/ViewWills";
import AddNominee from "./Components/User/AddNominee";
import ViewNominees from "./Components/User/ViewNominees";
import UpdateProfile from "./Components/User/UpdateProfile";
import NomineeDashboard from "./Components/Nominee/NomineeDashboard";
import NViewWills from "./Components/Nominee/NViewWills";
import NViewRequestStatus from "./Components/Nominee/NViewRequestStatus";
import ViewProfile from "./Components/Nominee/ViewProfile";



const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BeyondLifePremium />} />
          <Route path="/AuthPage" element={<AuthPage />} />
          <Route path="/admin">
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customerspage" element={<CustomersPage />} />
            <Route path="documentspage" element={<DocumentsPage />} />
            <Route path="nominee/request-access" element={<NomineeApprovalPage />} />
            <Route path="nominees" element={<AssignedNomineesPage />} />
          </Route>

          <Route path="/user">
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="uploadwill" element={<UploadWill />} />
            <Route path="documents" element={<ViewWills />} />
            <Route path="nominee/add" element={< AddNominee />} />
            <Route path="nominee/view" element={<ViewNominees />} />
            <Route path="updateprofile" element={<UpdateProfile />} />
          </Route>

          <Route path="/nominee">
            <Route path="dashboard" element={<NomineeDashboard />} />
            <Route path="viewwills" element={<NViewWills />} />
            <Route path="NViewRequestStatus" element={<NViewRequestStatus />} />
            <Route path="profile" element={<ViewProfile />} />


          </Route>





        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition:Bounce
        />
      </BrowserRouter>
    </div>
  );
};

export default App;
