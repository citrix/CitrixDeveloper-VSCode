export class PowershellDocument
{
    constructor
    (
        public name: string,
        public location:string,
        public children: Array<PowershellDocument>
    ) 
    {
        
    }
}