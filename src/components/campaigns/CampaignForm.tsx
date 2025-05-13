import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useCreateCampaignMutation } from '@/store/api/campaignApi';
import { CauseSelector } from './CauseSelector';
import { DonationType } from '@/types/donation';
import { CampaignStatus } from '@/types/campaings';
import { RootState } from '@/store/store';
import { toast } from 'react-hot-toast';
import {
   Input,
   Button,
   Textarea,
   Select,
   DatePicker,
   Checkbox,
   FileUpload,
   StepWizard,
   ProgressBar
} from '@/components/common';

const DONATION_TYPES = [
   { value: DonationType.MONEY, label: 'Money' },
   { value: DonationType.CLOTHES, label: 'Clothes' },
   { value: DonationType.BLOOD, label: 'Blood' },
   { value: DonationType.FOOD, label: 'Food' },
   { value: DonationType.TOYS, label: 'Toys' },
   { value: DonationType.BOOKS, label: 'Books' },
   { value: DonationType.FURNITURE, label: 'Furniture' },
   { value: DonationType.HOUSEHOLD, label: 'Household' },
   { value: DonationType.OTHER, label: 'Other' },
];

interface CampaignFormProps {
   onSuccess: () => void;
   initialData?: any;
   isEditMode?: boolean;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({
   onSuccess,
   initialData,
   isEditMode = false,
}) => {
   const { user } = useSelector((state: RootState) => state.auth);
   const [createCampaign, { isLoading }] = useCreateCampaignMutation();
   const [currentStep, setCurrentStep] = useState(1);

   const [formData, setFormData] = useState({
      title: initialData?.title || '',
      description: initialData?.description || '',
      startDate: initialData?.startDate || null,
      endDate: initialData?.endDate || null,
      status: initialData?.status || CampaignStatus.DRAFT,
      imageUrl: initialData?.imageUrl || '',
      totalTargetAmount: initialData?.totalTargetAmount || '',
      acceptedDonationTypes: initialData?.acceptedDonationTypes || [DonationType.MONEY],
      selectedCauses: initialData?.causes?.map((cause: any) => cause.id) || [],
   });

   const [errors, setErrors] = useState<Record<string, string>>({});

   const validateStep = (step: number) => {
      const newErrors: Record<string, string> = {};

      if (step === 1) {
         if (!formData.title) newErrors.title = 'Title is required';
         if (!formData.description) newErrors.description = 'Description is required';
         if (formData.description && formData.description.length < 20) {
            newErrors.description = 'Description should be at least 20 characters';
         }
      } else if (step === 2) {
         if (!formData.startDate) newErrors.startDate = 'Start date is required';
         if (!formData.endDate) newErrors.endDate = 'End date is required';
         if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = 'End date must be after start date';
         }
      } else if (step === 3) {
         if (formData.selectedCauses.length === 0) {
            newErrors.causes = 'At least one cause is required';
         }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleNext = () => {
      if (validateStep(currentStep)) {
         setCurrentStep(currentStep + 1);
      }
   };

   const handlePrevious = () => {
      setCurrentStep(currentStep - 1);
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
      if (errors[name]) {
         setErrors({ ...errors, [name]: '' });
      }
   };

   const handleDateChange = (name: string, date: Date | null) => {
      setFormData({ ...formData, [name]: date });
      if (errors[name]) {
         setErrors({ ...errors, [name]: '' });
      }
   };

   const handleDonationTypeChange = (type: DonationType) => {
      const currentTypes = [...formData.acceptedDonationTypes];
      const index = currentTypes.indexOf(type);

      if (index > -1) {
         currentTypes.splice(index, 1);
      } else {
         currentTypes.push(type);
      }

      setFormData({ ...formData, acceptedDonationTypes: currentTypes });
   };

   const handleCauseSelect = (causeId: string) => {
      const currentCauses = [...formData.selectedCauses];
      const index = currentCauses.indexOf(causeId);

      if (index > -1) {
         currentCauses.splice(index, 1);
      } else {
         currentCauses.push(causeId);
      }

      setFormData({ ...formData, selectedCauses: currentCauses });
      if (errors.causes) {
         setErrors({ ...errors, causes: '' });
      }
   };

   const handleImageUpload = (url: string) => {
      setFormData({ ...formData, imageUrl: url });
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateStep(currentStep)) return;

      try {
         const campaignData = {
            title: formData.title,
            description: formData.description,
            startDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
            endDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
            status: formData.status,
            imageUrl: formData.imageUrl,
            totalTargetAmount: Number(formData.totalTargetAmount || 0),
            organizations: [user?.id || ''],
            acceptedDonationTypes: formData.acceptedDonationTypes,
            causes: formData.selectedCauses,
         };

         await createCampaign(campaignData).unwrap();
         toast.success(`Campaign ${isEditMode ? 'updated' : 'created'} successfully!`);
         onSuccess();
      } catch (error) {
         console.error('Failed to save campaign:', error);
         toast.error('Failed to save campaign. Please try again.');
      }
   };

   return (
      <div className="w-full max-w-4xl mx-auto">
         <div className="mb-8">
            <StepWizard currentStep={currentStep} steps={[
               { number: 1, title: 'Basic Information' },
               { number: 2, title: 'Campaign Details' },
               { number: 3, title: 'Select Causes' },
               { number: 4, title: 'Review' }
            ]} />
         </div>

         <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
               <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Basic Information</h2>

                  <div>
                     <Input
                        label="Campaign Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        error={errors.title}
                        required
                     />
                  </div>

                  <div>
                     <Textarea
                        label="Campaign Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        error={errors.description}
                        rows={5}
                        required
                     />
                  </div>

                  <div>
                     <FileUpload
                        label="Campaign Image"
                        currentImage={formData.imageUrl}
                        onUpload={handleImageUpload}
                     />
                  </div>
               </div>
            )}

            {/* Step 2: Campaign Details */}
            {currentStep === 2 && (
               <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Campaign Details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <DatePicker
                           label="Start Date"
                           name="startDate"
                           value={formData.startDate}
                           onChange={(date) => handleDateChange('startDate', date)}
                           error={errors.startDate}
                           minDate={new Date()}
                           required
                        />
                     </div>

                     <div>
                        <DatePicker
                           label="End Date"
                           name="endDate"
                           value={formData.endDate}
                           onChange={(date) => handleDateChange('endDate', date)}
                           error={errors.endDate}
                           minDate={formData.startDate || new Date()}
                           required
                        />
                     </div>
                  </div>

                  <div>
                     <Input
                        label="Target Amount ($)"
                        name="totalTargetAmount"
                        type="number"
                        min="0"
                        value={formData.totalTargetAmount}
                        onChange={handleInputChange}
                        required
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accepted Donation Types
                     </label>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {DONATION_TYPES.map((type) => (
                           <Checkbox
                              key={type.value}
                              label={type.label}
                              checked={formData.acceptedDonationTypes.includes(type.value)}
                              onChange={() => handleDonationTypeChange(type.value)}
                           />
                        ))}
                     </div>
                     {formData.acceptedDonationTypes.length === 0 && (
                        <p className="text-red-500 text-sm mt-1">
                           Select at least one donation type
                        </p>
                     )}
                  </div>
               </div>
            )}

            {/* Step 3: Select Causes */}
            {currentStep === 3 && (
               <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Select Causes</h2>

                  <div>
                     <CauseSelector
                        selectedCauses={formData.selectedCauses}
                        onCauseSelect={handleCauseSelect}
                        organizationId={user?.id}
                     />
                     {errors.causes && (
                        <p className="text-red-500 text-sm mt-2">{errors.causes}</p>
                     )}
                  </div>
               </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
               <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Review Campaign</h2>

                  <div className="bg-gray-50 p-6 rounded-lg">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <h3 className="font-semibold text-lg mb-4">Campaign Details</h3>

                           <div className="space-y-3">
                              <div>
                                 <span className="font-medium">Title:</span> {formData.title}
                              </div>
                              <div>
                                 <span className="font-medium">Description:</span>
                                 <p className="mt-1 text-gray-600">{formData.description}</p>
                              </div>
                              <div>
                                 <span className="font-medium">Duration:</span>{' '}
                                 {formData.startDate && formData.endDate
                                    ? `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(
                                       formData.endDate
                                    ).toLocaleDateString()}`
                                    : 'Not set'}
                              </div>
                              <div>
                                 <span className="font-medium">Target Amount:</span> $
                                 {Number(formData.totalTargetAmount).toLocaleString()}
                              </div>
                           </div>
                        </div>

                        <div>
                           <h3 className="font-semibold text-lg mb-4">Additional Information</h3>

                           <div className="space-y-3">
                              <div>
                                 <span className="font-medium">Accepted Donations:</span>
                                 <div className="flex flex-wrap gap-2 mt-1">
                                    {formData.acceptedDonationTypes.map((type) => (
                                       <span
                                          key={type}
                                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                       >
                                          {DONATION_TYPES.find((t) => t.value === type)?.label || type}
                                       </span>
                                    ))}
                                 </div>
                              </div>

                              <div>
                                 <span className="font-medium">Selected Causes:</span> {formData.selectedCauses.length}
                              </div>

                              <div>
                                 <span className="font-medium">Status:</span>{' '}
                                 <span className="capitalize">{formData.status.toLowerCase()}</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {formData.imageUrl && (
                        <div className="mt-6">
                           <span className="font-medium">Campaign Image:</span>
                           <div className="mt-2 w-full h-40 relative">
                              <img
                                 src={formData.imageUrl}
                                 alt="Campaign preview"
                                 className="w-full h-full object-cover rounded-lg"
                              />
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}

            <div className="flex justify-between pt-4">
               {currentStep > 1 ? (
                  <Button type="button" variant="outline" onClick={handlePrevious}>
                     Previous
                  </Button>
               ) : (
                  <div></div>
               )}

               {currentStep < 4 ? (
                  <Button type="button" onClick={handleNext}>
                     Next
                  </Button>
               ) : (
                  <Button type="submit" isLoading={isLoading}>
                     {isEditMode ? 'Update Campaign' : 'Create Campaign'}
                  </Button>
               )}
            </div>
         </form>
      </div>
   );
}; 