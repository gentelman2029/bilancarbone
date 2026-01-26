-- Add DELETE policy for carbon_calculations_v2
CREATE POLICY "Users can delete their own calculations" 
ON public.carbon_calculations_v2 
FOR DELETE 
USING (auth.uid() = user_id);