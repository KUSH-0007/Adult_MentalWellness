
'use client';

import React from 'react';
import { saveSymptoms, SymptomFormState } from '@/app/actions';

const initialState: SymptomFormState = {
    message: null,
    success: false,
};

export function SymptomChecker() {
    const [state, formAction] = React.useActionState(saveSymptoms, initialState);

    return (
        <div>
            <h2>Symptom Checker</h2>
            <form action={formAction}>
                <textarea name="symptoms" placeholder="Enter your symptoms here..." />
                <button type="submit">Save Symptoms</button>
            </form>
            {state.message && <p>{state.message}</p>}
        </div>
    );
}
