<?php namespace App\Libraries;

trait ValidationTrait
{
    protected function validateRequest(array $rules, array $messages = []): ?array
    {
        if (!$this->validate($rules, $messages)) {
            return $this->validator->getErrors();
        }
        return null;
    }

    protected function getValidatedData(): array
    {
        return $this->validator->getValidated();
    }
}
