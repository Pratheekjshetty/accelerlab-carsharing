import fs from 'fs';
import path from 'path';
import driverModel from '../models/driverModels.js';
import userModel from '../models/userModels.js';

const applyDriver = async (req, res) => {
  console.log('Request Body:', req.body); 
  const {
    userId,
    firstName,lastName,
    email,phone,
    dob,gender,
    street,city,state,
    zipcode,country,
    alemail,alphone,
    adharnumber,
    licencenumber,
    expiredate,preferredLocation,
    experience,reference,
    language,availability,
  } = req.body;
  const address = { firstName ,lastName ,email ,phone ,dob ,gender ,street ,city ,state ,zipcode ,country ,alemail ,alphone };
  try {
    if (!userId) {
      return res.status(400).json({ success:false, message:'User ID is required' });
    }
    const existingDriver = await driverModel.findOne({ userId });
    if (existingDriver) {
      return res.status(400).json({ success:false, message:'Driver already applied' });
    }
    const driversLicense = req.files['driversLicense'][0];
    const proofOfAddress = req.files['proofOfAddress'][0];
    const driverData = new driverModel({
      userId,
      address,
      adharnumber,
      licencenumber,
      expiredate,
      preferredLocation,
      experience,
      reference,
      language,
      availability,
      driversLicense: path.join('doc-uploads', `${Date.now()}-${driversLicense.originalname}`),
      proofOfAddress: path.join('doc-uploads', `${Date.now()}-${proofOfAddress.originalname}`),
    });
    await driverData.save();
    fs.writeFileSync(driverData.driversLicense, driversLicense.buffer);
    fs.writeFileSync(driverData.proofOfAddress, proofOfAddress.buffer);
    res.status(201).json({success:true,message:'Driver application submitted successfully',});
  } catch (error) {
    console.error('Error applying for driver:', error);
    res.status(500).json({ success:false, message:'Failed to submit application' });
  }
};

// Get all driver applications
const getApplications = async(req,res) =>{
  try {
    const applications = await driverModel.find({});
    res.status(200).send(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).send({ message: 'Failed to fetch applications.' });
  }
};

// Update user role and driver application status
const updateApplicationStatus = async (req, res) => {
  try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      // Update user role
      const userRole = await userModel.findById(userId);
      if (!userRole) {
          return res.status(404).json({ message: "User not found" });
      }
      userRole.role = "driver";
      await userRole.save();
      // Update driver application status
      const driverApplication = await driverModel.findOne({ userId });
      if (!driverApplication) {
          return res.status(404).json({ message: "Driver application not found" });
      }
      driverApplication.status = "Driver Confirmed";
      await driverApplication.save();
      res.status(200).json({ message: "Driver Status updated successfully", userRole });
  } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).send({ message: 'Failed to update user role.' });
  }
};

// Delete user role and update driver application status
const deleteApplicationStatus = async (req, res) => {
  try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      // Update user role
      const userRole = await userModel.findById(userId);
      if (!userRole) {
          return res.status(404).json({ message: "User not found" });
      }
      userRole.role = "user";
      await userRole.save();
      // Update driver application status
      const driverApplication = await driverModel.findOne({ userId });
      if (!driverApplication) {
          return res.status(404).json({ message: "Driver application not found" });
      }
      driverApplication.status = "Driver Rejected";
      await driverApplication.save();
      res.status(200).json({ message: "Driver Status updated successfully", userRole });
  } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).send({ message: 'Failed to update user role.' });
  }
};

// Delete driver application
const deleteApplication = async (req, res) => {
  try {
      const { applyId } = req.body;
      const deletedApplication = await driverModel.findByIdAndDelete(applyId);
      if (!deletedApplication) {
          return res.status(404).json({ message: "Application not found" });
      }
      res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
      console.error('Error deleting application:', error);
      res.status(500).send({ message: 'Failed to delete application.' });
  }
};

// get driver by userId
const getDriverByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const driver = await driverModel.findOne({ userId });
    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }
    res.json({ success: true, driver });
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({ success: false, message: "Failed to fetch driver" });
  }
};

// edit driver by admin
const adminEditDriver = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      gender,
      street,
      city,
      state,
      zipcode,
      country,
      alemail,
      alphone,
      adharnumber,
      licencenumber,
      expiredate,
      preferredLocation,
      experience,
      reference,
      language,
      availability
    } = req.body;
    const driver = await driverModel.findOne({ userId });
    if (!driver) {
      return res.json({success:false,message:"Driver not found"});
    }
    // Update personal details
    driver.address.firstName = firstName || driver.address.firstName;
    driver.address.lastName = lastName || driver.address.lastName;
    driver.address.email = email || driver.address.email;
    driver.address.phone = phone || driver.address.phone;
    driver.address.dob = dob || driver.address.dob;
    driver.address.gender = gender || driver.address.gender;
    driver.address.street = street || driver.address.street;
    driver.address.city = city || driver.address.city;
    driver.address.state = state || driver.address.state;
    driver.address.zipcode = zipcode || driver.address.zipcode;
    driver.address.country = country || driver.address.country;
    driver.address.alemail = alemail || driver.address.alemail;
    driver.address.alphone = alphone || driver.address.alphone;
    // Update driving details
    driver.adharnumber = adharnumber || driver.adharnumber;
    driver.licencenumber = licencenumber || driver.licencenumber;
    driver.expiredate = expiredate || driver.expiredate;
    driver.preferredLocation = preferredLocation || driver.preferredLocation;
    driver.experience = experience || driver.experience;
    driver.reference = reference || driver.reference;
    driver.language = language || driver.language;
    driver.availability = availability || driver.availability;
    // Replace documents only if new files were uploaded
    if (req.files?.driversLicense?.[0]) {
      const file = req.files.driversLicense[0];
      const newPath = path.join('doc-uploads', `${Date.now()}-${file.originalname}`);
      fs.writeFileSync(newPath, file.buffer);
      // remove old file if it exists
      if (driver.driversLicense && fs.existsSync(driver.driversLicense)) {
        fs.unlinkSync(driver.driversLicense);
      }
      driver.driversLicense = newPath;
    }
    if (req.files?.proofOfAddress?.[0]) {
      const file = req.files.proofOfAddress[0];
      const newPath = path.join('doc-uploads', `${Date.now()}-${file.originalname}`);
      fs.writeFileSync(newPath, file.buffer);
      if (driver.proofOfAddress && fs.existsSync(driver.proofOfAddress)) {
        fs.unlinkSync(driver.proofOfAddress);
      }
      driver.proofOfAddress = newPath;
    }
    await driver.save();
    res.json({success:true,message:"Driver details updated successfully",driver});
  } catch (error) {
    console.error("Error updating driver:", error);
    res.json({success:false,message:"Failed to update driver details"});
  }
};

export { applyDriver, getApplications, updateApplicationStatus, deleteApplicationStatus, deleteApplication, getDriverByUserId, adminEditDriver };
