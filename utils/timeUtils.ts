
/**
 * Synchronizes age and birth year based on the current world year.
 * 
 * @param field The field being changed ('age' or 'birthday')
 * @param value The new value for the field
 * @param currentYear The current year in the game world
 * @param currentData The current object containing age and birthday
 * @returns An object with updated age and birthday
 */
export const syncAgeAndBirthday = (
  field: 'age' | 'birthday',
  value: any,
  currentYear: number,
  currentData: { age?: number; birthday?: string }
) => {
  let updatedAge = currentData.age;
  let updatedBirthday = currentData.birthday;

  if (field === 'age') {
    const newAge = parseInt(value) || 0;
    updatedAge = newAge;
    
    // Extract day and month from existing birthday if possible
    let day = 1;
    let month = 1;
    if (currentData.birthday) {
      const parts = currentData.birthday.match(/(\d+)/g);
      if (parts && parts.length >= 2) {
        day = parseInt(parts[0]) || 1;
        month = parseInt(parts[1]) || 1;
      }
    }
    
    // Calculate new birth year: BirthYear = CurrentYear - Age
    const birthYear = currentYear - newAge;
    updatedBirthday = `Ngày ${day} Tháng ${month} Năm ${birthYear}`;
  } 
  else if (field === 'birthday') {
    updatedBirthday = value;
    
    // Try to parse the year from the birthday string
    const parts = value.match(/Năm\s+(\d+)/i) || value.match(/(\d+)$/);
    if (parts && parts[1]) {
      const birthYear = parseInt(parts[1]);
      if (!isNaN(birthYear)) {
        // Calculate new age: Age = CurrentYear - BirthYear
        updatedAge = currentYear - birthYear;
      }
    }
  }

  return { age: updatedAge, birthday: updatedBirthday };
};
